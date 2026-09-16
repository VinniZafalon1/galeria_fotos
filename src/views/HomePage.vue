<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Minha Galeria</ion-title><ion-buttons slot="end"><ion-button router-link="/sobre" aria-label="Sobre"><ion-icon slot="icon-only" :icon="informationCircleOutline" /></ion-button><ion-button @click="signOut">Sair</ion-button></ion-buttons></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <section class="welcome"><h1>Olá, {{ user?.name || 'usuário' }}!</h1><p>{{ photos.length ? `${photos.length} foto${photos.length > 1 ? 's' : ''} na sua galeria` : 'Adicione fotos para criar sua galeria.' }}</p></section>
      <div v-if="photos.length" class="photo-grid"><article v-for="photo in photos" :key="photo.id" class="photo-card"><img :src="photo.dataUrl" alt="Foto da galeria"><div class="photo-actions"><ion-button class="share-button" size="small" aria-label="Compartilhar foto" @click="sharePhoto(photo)"><ion-icon slot="icon-only" :icon="shareSocialOutline" /></ion-button><ion-button class="remove-button" color="danger" size="small" aria-label="Excluir foto" @click="remove(photo.id!)"><ion-icon slot="icon-only" :icon="trashOutline" /></ion-button></div></article></div>
      <div v-else class="empty-state"><ion-icon :icon="imagesOutline" /><h2>Sua galeria está vazia</h2><p>Use o botão + para tirar ou selecionar uma foto.</p></div>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button @click="addPhoto"><ion-icon :icon="add" /></ion-fab-button></ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { add, imagesOutline, informationCircleOutline, shareSocialOutline, trashOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { getCurrentUser, logoutUser, type UserAccount } from '@/services/auth';
import { addPhoto as savePhoto, deletePhoto, getPhotos, type Photo } from '@/services/database';

const router = useRouter(); const user = ref<Pick<UserAccount, 'name' | 'email'>>(); const photos = ref<Photo[]>([]);
async function load() { user.value = getCurrentUser() || undefined; if (!user.value) return router.replace('/login'); photos.value = await getPhotos(user.value.email); }
onMounted(load);
async function addPhotoChoice() { const choice = await alertController.create({ header: 'Adicionar foto', buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Galeria', handler: () => choose(CameraSource.Photos) }, { text: 'Câmera', handler: () => choose(CameraSource.Camera) }] }); await choice.present(); }
const addPhoto = addPhotoChoice;
async function choose(source: CameraSource) { try { const image = await Camera.getPhoto({ quality: 85, width: 1200, resultType: CameraResultType.DataUrl, source }); if (image.dataUrl && user.value) { await savePhoto({ userEmail: user.value.email, dataUrl: image.dataUrl, createdAt: new Date().toISOString() }); await load(); } } catch (error) { if (!String(error).toLowerCase().includes('cancel')) { const toast = await toastController.create({ message: 'Não foi possível obter a foto.', color: 'danger', duration: 2200 }); await toast.present(); } } }
async function sharePhoto(photo: Photo) { try { const path = `galeria-${photo.id ?? Date.now()}.jpeg`; const base64 = photo.dataUrl.split(',')[1] || photo.dataUrl; await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache }); const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache }); await Share.share({ title: 'Foto da Minha Galeria', text: 'Confira esta foto!', files: [uri], dialogTitle: 'Compartilhar foto' }); } catch { const toast = await toastController.create({ message: 'Não foi possível compartilhar esta foto.', color: 'danger', duration: 2200 }); await toast.present(); } }
async function remove(id: number) { await deletePhoto(id); await load(); } async function signOut() { logoutUser(); router.replace('/login'); }
</script>
