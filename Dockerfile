FROM node:18-alpine

WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Baue die Anwendung
RUN npm run build

# Exponiere den Port
EXPOSE 3000

# Starte die Anwendung
CMD ["npm", "start"] 