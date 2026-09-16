<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Minhas fotos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Minhas fotos</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list v-if="fotos.length">
        <ion-item v-for="foto in fotos" :key="foto.name">
          <ion-thumbnail slot="start">
            <ion-img
              :src="foto.src"
              :alt="`Foto ${foto.name}`"
            />
          </ion-thumbnail>

          <ion-label>{{ foto.name }}</ion-label>

          <ion-button
            slot="end"
            fill="clear"
            :aria-label="`Compartilhar ${foto.name}`"
            @click="compartilharFoto(foto)"
          >
            <ion-icon :icon="shareSocialOutline" aria-hidden="true" />
          </ion-button>

          <ion-button
            slot="end"
            fill="clear"
            color="danger"
            :aria-label="`Excluir ${foto.name}`"
            @click="excluirFoto(foto.name)"
          >
            <ion-icon
              :icon="trashOutline"
              aria-hidden="true"
            />
          </ion-button>
        </ion-item>
      </ion-list>

      <ion-card v-else>
        <ion-card-content>
          Nenhuma foto armazenada.
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  toastController,
  onIonViewWillEnter,
} from '@ionic/vue'

import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { shareSocialOutline, trashOutline } from 'ionicons/icons'
import { ref } from 'vue'

type Foto = {
  name: string
  src: string
}

const fotos = ref<Foto[]>([])

async function carregarFotos() {
  try {
    const { files } = await Filesystem.readdir({
      directory: Directory.Data,
      path: '',
    })

    const arquivos = files.filter(
      (file) =>
        file.name.startsWith('foto-') &&
        file.name.endsWith('.jpg')
    )

    fotos.value = await Promise.all(
      arquivos.map(async (file) => {
        const resultado = await Filesystem.readFile({
          directory: Directory.Data,
          path: file.name,
        })

        return {
          name: file.name,
          src: `data:image/jpeg;base64,${resultado.data}`,
        }
      })
    )
  } catch (error) {
    console.error('Erro ao carregar fotos:', error)

    fotos.value = []

    await mostrarToast(
      'Não foi possível carregar as fotos',
      'danger'
    )
  }
}

async function excluirFoto(nome: string) {
  try {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: nome,
    })

    await carregarFotos()

    await mostrarToast(
      'Foto excluída com sucesso',
      'success'
    )
  } catch (error) {
    console.error('Erro ao excluir foto:', error)

    await mostrarToast(
      'Não foi possível excluir a foto',
      'danger'
    )
  }
}

async function compartilharFoto(foto: Foto) {
  try {
    const path = `compartilhar-${foto.name}`
    const base64 = foto.src.split(',')[1]
    if (!base64) throw new Error('Imagem inválida')
    await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache })
    const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache })
    await Share.share({ title: 'Foto da Minha Galeria', files: [uri], dialogTitle: 'Compartilhar foto' })
  } catch (error) {
    console.error('Erro ao compartilhar foto:', error)
    await mostrarToast('Não foi possível compartilhar a foto', 'danger')
  }
}

async function mostrarToast(
  mensagem: string,
  cor: 'success' | 'danger'
) {
  const toast = await toastController.create({
    message: mensagem,
    duration: 2000,
    color: cor,
    position: 'bottom',
  })

  await toast.present()
}

onIonViewWillEnter(() => {
  carregarFotos()
})
</script>
