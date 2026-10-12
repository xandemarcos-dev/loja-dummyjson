import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './NavItem.module.css';

interface NavItemProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  /** `end` faz "/" ficar ativo só na home, e não em todas as rotas. */
  end?: boolean;
  block?: boolean;
  onClick?: () => void;
}

/** Link de navegação com destaque visual (e aria-current) para a rota ativa. */
export function NavItem({ to, children, icon, end, block, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [classes.link, block ? classes.block : '', isActive ? classes.active : ''].filter(Boolean).join(' ')
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
