import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ClipboardList, Home, ShoppingBag, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/historial", label: "Historial", icon: ClipboardList, end: false },
  { to: "/tienda", label: "Tienda", icon: ShoppingBag, end: false },
  { to: "/perfil", label: "Perfil", icon: User, end: false },
];

/**
 * Shell de la app: barra de tabs fija abajo (estilo app móvil) + el
 * contenido de la ruta activa arriba. Mobile-first a propósito — esta
 * misma estructura es la que después se empaqueta con Capacitor.
 */
export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium ${
                isActive ? "text-primary" : "text-muted"
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
