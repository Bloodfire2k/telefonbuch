export const THEME = {
  primary: "#2b64b1",
  primaryHover: "#235091",
  background: "#f5f5f5",
};

// CardDAV-Konfiguration aus Umgebungsvariablen - KEINE hardcodierten Werte!
export const CARDDAV_CONFIG = {
  url: process.env.CARDDAV_URL,
  username: process.env.CARDDAV_USERNAME,
  password: process.env.CARDDAV_PASSWORD
}; 