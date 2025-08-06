
import "./globals.css";
import { UserProvider } from "@/context/userContext";
import Navbar from "@/components/navbar";

export const metadata = {
  title: "MétéoNext - Prévisions météo personnalisées",
  description: "Application de prévisions météo avec connexion persistante et fonctionnalités premium",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`antialiased min-h-screen bg-gradient`}>
          <UserProvider>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
              {children}
            </div>
          </UserProvider>
      </body>
    </html>
  );
}
