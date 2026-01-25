import LoginForm from '../LoginForm';

// 🥖 PAMBASO - Página de Login Móvil
// Interfaz optimizada para dispositivos táctiles con navegación nativa
export function MobileLoginPage() {
  return <LoginForm isMobile={true} />;
};

export default MobileLoginPage;