import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import './assets/main.css'

const TacticalCommand = definePreset(Lara, {
    semantic: {
        primary: {
            50: '#EBF5D0',
            100: '#DDE7C3',
            200: '#C1CBA8',
            300: '#A5AF8E',
            400: '#8B9575',
            500: '#717B5D',
            600: '#596245',
            700: '#414A2F',
            800: '#2B331B',
            900: '#171E08',
            950: '#000000'
        }
    }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { theme: { preset: TacticalCommand, options: { darkModeSelector: 'system' } } })
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
