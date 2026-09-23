const API_URL =
  'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records'

export type EstablishmentType = 'all' | 'Ecole' | 'Collège' | 'Lycée' | 'EREA' | 'CIO'

export interface Establishment {
  id: string
  name: string
  type: string
  status: string
  address: string
  postalCode: string
  city: string
  latitude: number
  longitude: number
  website?: string
  pronoteUrl?: string
  pronoteCandidates?: string[]
  distanceKm?: number
}

export interface EstablishmentCity {
  id: string
  name: string
  department: string
  postalCodes: string[]
}

interface ApiRecord {
  identifiant_de_l_etablissement?: string
  nom_etablissement?: string
  type_etablissement?: string
  etat?: string
  adresse_1?: string
  adresse_2?: string
  adresse_3?: string
  code_postal?: string
  code_departement?: string
  nom_commune?: string
  latitude?: number | string
  longitude?: number | string
  position?: [number, number] | { lat?: number | string; lon?: number | string; latitude?: number | string; longitude?: number | string }
  web?: string
}

function toNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('fr-FR')
    .trim()
}

function escapeWhereValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const earthRadius = 6371
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(bLat - aLat)
  const dLon = toRadians(bLon - aLon)
  const sinLat = Math.sin(dLat / 2)
  const sinLon = Math.sin(dLon / 2)
  const h = sinLat * sinLat + Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * sinLon * sinLon
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function normalize(record: ApiRecord, origin?: { latitude: number; longitude: number }): Establishment | null {
  const positionLatitude = Array.isArray(record.position)
    ? record.position[0]
    : record.position?.lat ?? record.position?.latitude
  const positionLongitude = Array.isArray(record.position)
    ? record.position[1]
    : record.position?.lon ?? record.position?.longitude
  const latitude = toNumber(record.latitude ?? positionLatitude)
  const longitude = toNumber(record.longitude ?? positionLongitude)
  if (latitude === null || longitude === null || !record.nom_etablissement) return null

  const website = record.web?.trim() || undefined
  const rne = record.identifiant_de_l_etablissement?.trim().toUpperCase()
  const hostedPronoteUrl = rne && /^[A-Z0-9]{7,8}$/.test(rne)
    ? `https://${rne.toLowerCase()}.index-education.net/pronote/`
    : undefined
  const pronoteUrl = website && /index-education\.net/i.test(website) && /pronote/i.test(website)
    ? website
    : hostedPronoteUrl

  const candidates = [
    ...(website && /pronote|index-education/i.test(website) ? [website] : []),
    ...(hostedPronoteUrl ? [hostedPronoteUrl] : []),
  ]

  return {
    id: record.identifiant_de_l_etablissement || `${record.nom_etablissement}-${record.code_postal ?? ''}`,
    name: record.nom_etablissement,
    type: record.type_etablissement || 'Établissement',
    status: record.etat || 'OUVERT',
    address: [record.adresse_1, record.adresse_2, record.adresse_3].filter(Boolean).join(', '),
    postalCode: record.code_postal || '',
    city: record.nom_commune || '',
    latitude,
    longitude,
    website,
    pronoteUrl: pronoteUrl ?? candidates[0],
    pronoteCandidates: candidates,
    distanceKm: origin ? haversineKm(origin.latitude, origin.longitude, latitude, longitude) : undefined,
  }
}

export async function searchEstablishments(options: {
  type?: EstablishmentType
  city?: string
  department?: string
}): Promise<Establishment[]> {
  const params = new URLSearchParams({
    limit: '100',
    select:
      'identifiant_de_l_etablissement,nom_etablissement,type_etablissement,etat,adresse_1,adresse_2,adresse_3,code_postal,code_departement,nom_commune,latitude,longitude,position,web',
  })
  params.set('refine', 'etat:OUVERT')
  if (options.type && options.type !== 'all') params.append('refine', `type_etablissement:${options.type}`)
  if (options.city) params.set('where', `nom_commune = "${escapeWhereValue(options.city)}"`)
  if (options.department) params.append('refine', `code_departement:${options.department}`)

  const response = await fetch(`${API_URL}?${params.toString()}`)
  if (!response.ok) throw new Error(`Annuaire indisponible (${response.status})`)
  const payload = (await response.json()) as { results?: ApiRecord[] }
  return (payload.results ?? [])
    .map((record) => normalize(record))
    .filter((record): record is Establishment => record !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export async function searchCities(query: string): Promise<EstablishmentCity[]> {
  const cleanQuery = query.trim()
  const params = new URLSearchParams({
    limit: '100',
    select: 'nom_commune,code_departement,code_postal',
    where: `nom_commune like "%${escapeWhereValue(cleanQuery)}%"`,
  })
  params.set('refine', 'etat:OUVERT')

  let response = await fetch(`${API_URL}?${params.toString()}`)
  let payload = response.ok ? ((await response.json()) as { results?: ApiRecord[] }) : null
  if (!response.ok || !(payload?.results?.length)) {
    const fallback = new URLSearchParams({
      limit: '100',
      q: cleanQuery,
      select: 'nom_commune,code_departement,code_postal',
    })
    fallback.set('refine', 'etat:OUVERT')
    response = await fetch(`${API_URL}?${fallback.toString()}`)
    payload = response.ok ? ((await response.json()) as { results?: ApiRecord[] }) : null
  }
  if (!response.ok) throw new Error(`Annuaire indisponible (${response.status})`)
  const normalizedQuery = normalizeText(cleanQuery)
  const cities = new Map<string, EstablishmentCity>()

  for (const record of payload?.results ?? []) {
    if (!record.nom_commune || !normalizeText(record.nom_commune).includes(normalizedQuery)) continue
    const department = record.code_departement || ''
    const id = `${record.nom_commune}-${department}`
    const city = cities.get(id) ?? { id, name: record.nom_commune, department, postalCodes: [] }
    if (record.code_postal && !city.postalCodes.includes(record.code_postal)) city.postalCodes.push(record.code_postal)
    cities.set(id, city)
  }

  return [...cities.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr')).slice(0, 12)
}
