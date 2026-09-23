import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LogOut } from 'lucide-react'
import { Button } from '../components/ui'
import { LogoMark } from '../components/Logo'

export function LogoutPage() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="glass-panel w-full max-w-md rounded-[28px] p-8"
      >
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-accent-softer">
          <LogoMark size={44} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">À bientôt</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Vous avez été déconnecté(e) de SCHOOLFLOW. Votre session locale a été fermée et aucune
          donnée sensible n'a été conservée.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link to="/login">
            <Button size="lg" className="w-full">
              <LogOut className="size-4.5" aria-hidden />
              Se reconnecter
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="secondary" className="w-full">
              Retour à l'accueil
              <ArrowRight className="size-4.5" aria-hidden />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
