<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Sobre</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <section class="about-intro"><ion-icon :icon="imagesOutline" /><h1>Minha Galeria</h1><p>Informações do aplicativo</p></section>
      <ion-list inset>
        <ion-item><ion-icon slot="start" :icon="wifiOutline" :color="isOnline ? 'success' : 'danger'" /><ion-label><h2>{{ isOnline ? 'Você está online' : 'Você está offline' }}</h2><p>{{ isOnline ? 'Conexão com a internet disponível.' : 'Verifique sua conexão com a internet.' }}</p></ion-label></ion-item>
        <ion-item button detail @click="updateLocation"><ion-icon slot="start" :icon="locationOutline" /><ion-label><h2>Sua localização</h2><p v-if="loadingLocation">Obtendo localização…</p><p v-else-if="locationError">{{ locationError }}</p><p v-else>Latitude: {{ location.latitude }}<br>Longitude: {{ location.longitude }}<br>Altitude: {{ location.altitude }}</p></ion-label></ion-item>
        <ion-item><ion-icon slot="start" :icon="theme === 'dark' ? moonOutline : sunnyOutline" /><ion-label><h2>Modo escuro</h2><p>{{ theme === 'dark' ? 'Ativado' : 'Desativado' }}</p></ion-label><ion-toggle slot="end" :checked="theme === 'dark'" aria-label="Alternar modo escuro" @ion-change="changeTheme" /></ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { Network } from '@capacitor/network'
import { IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/vue'
import { imagesOutline, locationOutline, moonOutline, sunnyOutline, wifiOutline } from 'ionicons/icons'
import { getSavedTheme, saveTheme, type Theme } from '@/services/settings'

const theme = ref<Theme>('light')
const isOnline = ref(true)
const loadingLocation = ref(false)
const locationError = ref('Toque para permitir e obter sua localização.')
const location = ref({ latitude: '—', longitude: '—', altitude: 'Não disponível' })
let removeNetworkListener: (() => Promise<void>) | undefined

async function updateLocation() { loadingLocation.value = true; locationError.value = ''; try { const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 }); location.value = { latitude: position.coords.latitude.toFixed(6), longitude: position.coords.longitude.toFixed(6), altitude: position.coords.altitude === null ? 'Não disponível' : `${position.coords.altitude.toFixed(1)} m` } } catch { locationError.value = 'Não foi possível obter a localização. Verifique a permissão do dispositivo.' } finally { loadingLocation.value = false } }
async function changeTheme(event: CustomEvent<{ checked: boolean }>) { theme.value = event.detail.checked ? 'dark' : 'light'; await saveTheme(theme.value) }
onMounted(async () => { theme.value = await getSavedTheme(); isOnline.value = (await Network.getStatus()).connected; const listener = await Network.addListener('networkStatusChange', status => { isOnline.value = status.connected }); removeNetworkListener = () => listener.remove(); updateLocation() })
onBeforeUnmount(() => removeNetworkListener?.())
</script>
