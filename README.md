# Minha Galeria

## Identificação

- **Nome do aluno:** Vinicius Pamplona Zafalon
- **Nome do curso:** Informática
- **Unidade curricular:** Codificar aplicações para dispositivos móveis

## Explicação do projeto

Aplicativo mobile desenvolvido com Ionic Vue e Capacitor para organizar fotos pessoais. O usuário cria uma conta, realiza login e acessa uma galeria protegida, onde pode adicionar fotos pela câmera ou pela galeria do dispositivo e removê-las quando desejar.

Os dados de usuários, sessão e fotos são persistidos localmente no IndexedDB do dispositivo. As senhas não são salvas em texto puro: o aplicativo armazena apenas seu hash SHA-256.

## Como rodar

### Pré-requisitos

- Node.js 18 ou superior
- npm
- Para executar no Android: Android Studio com SDK configurado

### Navegador

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`.

### Gerar versão de produção

```bash
npm run build
```

### Android

Após gerar a versão de produção, sincronize os arquivos com o projeto Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

No Android Studio, conecte um dispositivo ou inicie um emulador e execute o projeto. Na primeira utilização, autorize o acesso à câmera e às fotos quando solicitado.
