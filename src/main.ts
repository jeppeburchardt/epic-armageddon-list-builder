import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'

// Tactical Command Interface Theme Preset
const TacticalCommand = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{surface.50}',
            100: '{surface.100}',
            200: '{surface.200}',
            300: '{surface.300}',
            400: '{surface.400}',
            500: '#535C40', // Primary olive drab
            600: '#454d35',
            700: '#373e2a',
            800: '#292e1f',
            900: '#1b1f14',
            950: '{surface.950}',
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#535C40',
                    contrastColor: '#CAD4B1',
                    hoverColor: '#454d35',
                    activeColor: '#373e2a',
                },
                surface: {
                    0: '#ffffff',
                    50: '#f8f9f8',
                    100: '#e2e3df',
                    200: '#c5c7bf',
                    300: '#a8aa9f',
                    400: '#8b8e7f',
                    500: '#6e715f',
                    600: '#585b4c',
                    700: '#424439',
                    800: '#2c2e26',
                    900: '#1a1c1a',
                    950: '#121412',
                },
            },
            dark: {
                primary: {
                    color: '#C1CBA8',
                    contrastColor: '#2C3131',
                    hoverColor: '#CAD4B1',
                    activeColor: '#D4DDBD',
                },
                highlight: {
                    background: '#535C40',
                    focusBackground: '#454d35',
                    color: '#CAD4B1',
                    focusColor: '#CAD4B1',
                },
                surface: {
                    0: '#121412',
                    50: '#1a1c1a',
                    100: '#212321',
                    200: '#282a28',
                    300: '#2f312f',
                    400: '#363836',
                    500: '#3d3f3d',
                    600: '#535553',
                    700: '#696b69',
                    800: '#7f817f',
                    900: '#a8aaa8',
                    950: '#e2e3df',
                },
            },
        },
    },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: TacticalCommand,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark',
            cssLayer: false,
        },
    },
})
app.use(ToastService)
app.use(ConfirmationService)

// Import main.css after PrimeVue to allow overrides
import('./assets/main.css')

app.mount('#app')
