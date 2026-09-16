<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Minhas fotos</ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Sair" @click="handleLogout">
            <ion-icon slot="icon-only" :icon="logOutOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
 
    <ion-content class="home-content">
      <section class="welcome">
        <span>Ola, {{ currentUser?.name || 'usuario' }}</span>
        <h1>Galeria</h1>
      </section>
 
      <div v-if="photos.length" class="photo-grid">
        <article v-for="photo in photos" :key="photo.id" class="photo-tile">
          <img :src="photo.src" alt="Foto selecionada" />
          <div class="photo-actions">
            <ion-button class="share-button" size="small" shape="round" aria-label="Compartilhar foto" @click="sharePhoto(photo)"><ion-icon slot="icon-only" :icon="shareSocialOutline" /></ion-button>
            <ion-button class="remove-button" color="danger" size="small" shape="round" aria-label="Remover foto" @click="removePhoto(photo.id)"><ion-icon slot="icon-only" :icon="trashOutline" /></ion-button>
          </div>
        </article>
      </div>
 
      <ion-card v-else class="empty-state">
        <ion-card-content>
          Nenhuma foto escolhida. Use o botao inferior para abrir a camera ou a galeria.
        </ion-card-content>
      </ion-card>
 
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button aria-label="Adicionar foto" @click="openPhotoOptions">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>
 
<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  actionSheetController,
  toastController
} from '@ionic/vue'
 
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
 
import {
  addOutline,
  cameraOutline,
  imagesOutline,
  logOutOutline,
  shareSocialOutline,
  trashOutline
} from 'ionicons/icons'
 
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, logoutUser } from '@/services/auth'
 
interface PhotoItem {
  id: string
  path: string
  src: string
}
 
const PHOTOS_KEY = 'galeria_foto_photos'
 
const router = useRouter()
const photos = ref<PhotoItem[]>([])
const currentUser = getCurrentUser()
 
/* =========================
   TOAST
========================= */
 
async function showToast(message: string, color = 'primary') {
  const toast = await toastController.create({
    message,
    color,
    duration: 2200,
    position: 'bottom'
  })
 
  await toast.present()
}
 
/* =========================
   SALVAR LISTA DE FOTOS
========================= */
 
function savePhotos() {
  // Não precisa salvar a imagem inteira no localStorage.
  // Salvamos apenas os dados necessários para encontrar os arquivos.
  const photosToSave = photos.value.map((photo) => ({
    id: photo.id,
    path: photo.path
  }))
 
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photosToSave))
}
 
/* =========================
   CARREGAR FOTOS
========================= */
 
async function loadPhotos() {
  try {
    const savedPhotos = localStorage.getItem(PHOTOS_KEY)
 
    if (!savedPhotos) {
      photos.value = []
      return
    }
 
    const saved = JSON.parse(savedPhotos) as {
      id: string
      path: string
    }[]
 
    const loadedPhotos: PhotoItem[] = []
 
    for (const photo of saved) {
      try {
        const file = await Filesystem.readFile({
          path: photo.path,
          directory: Directory.Data
        })
 
        loadedPhotos.push({
          id: photo.id,
          path: photo.path,
          src: `data:image/jpeg;base64,${file.data}`
        })
      } catch (error) {
        console.warn('Não foi possível carregar a foto:', photo.path)
      }
    }
 
    photos.value = loadedPhotos
 
    // Atualiza a lista caso algum arquivo tenha sido apagado
    savePhotos()
  } catch (error) {
    console.error('Erro ao carregar fotos:', error)
    photos.value = []
  }
}
 
/* =========================
   SALVAR UMA FOTO
========================= */
 
async function salvarImagem(dataUrl: string, id: string) {
  const base64Data = dataUrl.split(',')[1]
 
  if (!base64Data) {
    throw new Error('Formato de imagem inválido')
  }
 
  const path = `foto-${id}.jpg`
 
  await Filesystem.writeFile({
    path,
    data: base64Data,
    directory: Directory.Data
  })
 
  return path
}
 
/* =========================
   ADICIONAR FOTO
========================= */
 
async function addPhoto(source: CameraSource) {
  try {
    const permission = await Camera.requestPermissions({
      permissions:
        source === CameraSource.Camera
          ? ['camera']
          : ['photos']
    })
 
    const allowed =
      source === CameraSource.Camera
        ? permission.camera === 'granted'
        : permission.photos === 'granted' ||
          permission.photos === 'limited'
 
    if (!allowed) {
      await showToast(
        'Permissão negada para acessar este recurso.',
        'danger'
      )
      return
    }
 
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source,
      quality: 85,
      width: 1200
    })
 
    if (!photo.dataUrl) return
 
    // Cada foto recebe um ID único
    const id = crypto.randomUUID()
 
    // Salva a imagem no armazenamento do aplicativo
    const path = await salvarImagem(photo.dataUrl, id)
 
    // Adiciona a nova foto no início da lista
    photos.value = [
      {
        id,
        path,
        src: photo.dataUrl
      },
      ...photos.value
    ]
 
    // Salva a lista
    savePhotos()
 
    await showToast('Foto adicionada com sucesso!', 'success')
  } catch (error) {
    if (String(error).toLowerCase().includes('cancel')) {
      return
    }
 
    console.error(error)
 
    await showToast(
      'Não foi possível carregar a foto.',
      'danger'
    )
  }
}
 
/* =========================
   OPÇÕES DA FOTO
========================= */
 
async function openPhotoOptions() {
  const actionSheet = await actionSheetController.create({
    header: 'Adicionar foto',
    buttons: [
      {
        text: 'Câmera',
        icon: cameraOutline,
        handler: () => addPhoto(CameraSource.Camera)
      },
      {
        text: 'Galeria',
        icon: imagesOutline,
        handler: () => addPhoto(CameraSource.Photos)
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  })
 
  await actionSheet.present()
}
 
/* =========================
   REMOVER FOTO
========================= */
 
async function removePhoto(id: string) {
  try {
    const photo = photos.value.find(
      (item) => item.id === id
    )
 
    if (!photo) return
 
    // Apaga o arquivo físico
    await Filesystem.deleteFile({
      path: photo.path,
      directory: Directory.Data
    })
 
    // Remove somente essa foto da lista
    photos.value = photos.value.filter(
      (item) => item.id !== id
    )
 
    // Atualiza a lista salva
    savePhotos()
 
    await showToast('Foto removida.', 'success')
  } catch (error) {
    console.error('Erro ao remover foto:', error)
 
    await showToast(
      'Não foi possível remover a foto.',
      'danger'
    )
  }
}

async function sharePhoto(photo: PhotoItem) {
  try {
    const path = `compartilhar-${photo.id}.jpg`
    const base64 = photo.src.split(',')[1]
    if (!base64) throw new Error('Imagem inválida')
    await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache })
    const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache })
    await Share.share({ title: 'Foto da Minha Galeria', files: [uri], dialogTitle: 'Compartilhar foto' })
  } catch {
    await showToast('Não foi possível compartilhar esta foto.', 'danger')
  }
}
 
/* =========================
   LOGOUT
========================= */
 
async function handleLogout() {
  logoutUser()
  await router.replace('/login')
}
 
/* =========================
   INICIALIZAÇÃO
========================= */
 
onMounted(loadPhotos)
</script>
