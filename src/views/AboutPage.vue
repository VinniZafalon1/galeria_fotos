<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button
            default-href="/home" /></ion-buttons><ion-title>Sobre</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <section class="about-intro"><ion-icon :icon="imagesOutline" />
        <h1>Minha Galeria</h1>
        <p>Versão {{ version }}</p>
      </section>
      <ion-list inset>
        <ion-item><ion-icon slot="start" :icon="wifiOutline" :color="isOnline ? 'success' : 'danger'" /><ion-label>
            <h2>{{ isOnline ? 'Conectado à internet' : 'Sem conexão com a internet' }}</h2>
            <p>{{ isOnline ? 'Os recursos online estão disponíveis.' : 'Verifique sua rede para usar recursos online.'
              }}</p>
          </ion-label></ion-item>
        <ion-item button detail @click="updateLocation"><ion-icon slot="start" :icon="locationOutline" /><ion-label>
            <h2>Sua localização</h2>
            <p v-if="locationLoading">Obtendo localização…</p>
            <p v-else-if="locationError">{{ locationError }}</p>
            <p v-else>Latitude: {{ location.latitude }}<br>Longitude: {{ location.longitude }}<br>Altitude: {{
              location.altitude }}</p>
          </ion-label></ion-item>
        <ion-item><ion-icon slot="start" :icon="theme === 'dark' ? moonOutline : sunnyOutline" /><ion-label>
            <h2>Modo escuro</h2>
            <p>{{ theme === 'dark' ? 'Ativado' : 'Desativado' }}</p>
          </ion-label><ion-toggle slot="end" :checked="theme === 'dark'" aria-label="Ativar modo escuro"
            @ion-change="changeTheme" /></ion-item>
        <ion-item button detail @click="showTerms"><ion-icon slot="start"
            :icon="documentTextOutline" /><ion-label>Termos de uso</ion-label></ion-item>
        <ion-item button detail @click="showPrivacy"><ion-icon slot="start"
            :icon="shieldCheckmarkOutline" /><ion-label>Política de privacidade</ion-label></ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToggle, IonToolbar, alertController } from '@ionic/vue';
import { documentTextOutline, imagesOutline, locationOutline, moonOutline, shieldCheckmarkOutline, sunnyOutline, wifiOutline } from 'ionicons/icons';
import { getSavedTheme, saveTheme, type Theme } from '@/services/settings';

const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
const theme = ref<Theme>('light'); const isOnline = ref(true); const locationLoading = ref(false); const locationError = ref('Toque para permitir e obter sua localização.');
const location = ref({ latitude: '—', longitude: '—', altitude: 'Não disponível' });
let removeNetworkListener: (() => Promise<void>) | undefined;

async function updateLocation() { locationLoading.value = true; locationError.value = ''; try { const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 }); location.value = { latitude: position.coords.latitude.toFixed(6), longitude: position.coords.longitude.toFixed(6), altitude: position.coords.altitude === null ? 'Não disponível' : `${position.coords.altitude.toFixed(1)} m` }; } catch { locationError.value = 'Não foi possível obter a localização. Verifique a permissão do dispositivo.'; } finally { locationLoading.value = false; } }
async function changeTheme(event: CustomEvent<{ checked: boolean }>) { theme.value = event.detail.checked ? 'dark' : 'light'; await saveTheme(theme.value); }
async function showTerms() { const alert = await alertController.create({ header: 'Termos de uso', message: 'Use o aplicativo de forma responsável. Você é responsável pelas fotos adicionadas à sua galeria.', buttons: ['Entendi'] }); await alert.present(); }
async function showPrivacy() { const alert = await alertController.create({ header: 'Política de privacidade', message: 'Suas credenciais e fotos são armazenadas somente no dispositivo. O aplicativo não envia suas imagens a servidores.', buttons: ['Entendi'] }); await alert.present(); }
onMounted(async () => { theme.value = await getSavedTheme(); isOnline.value = (await Network.getStatus()).connected; const listener = await Network.addListener('networkStatusChange', status => { isOnline.value = status.connected; }); removeNetworkListener = () => listener.remove(); updateLocation(); });
onBeforeUnmount(() => removeNetworkListener?.());
</script>
