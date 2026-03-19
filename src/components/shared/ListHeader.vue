<script setup lang="ts">
import { computed, inject } from 'vue';
import { listEditorKey } from '@/composables/useListEditor';

import Inplace from 'primevue/inplace';
import ProgressBar from 'primevue/progressbar';
// import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

const {
  list,
  armyDef,
  totalPoints,
//   updateName,
  updatePointsLimit,
} = inject(listEditorKey)!

const value = computed(() => Math.ceil((totalPoints.value / (list.value?.pointsLimit ?? 0)) * 100))

</script>

<template>
    <div class="header">
        <div class="title">
            {{ list?.name }}
            <!-- <inplace>
                <template #display>
                    <span class="name-display">{{ list?.name }}</span>
                </template>
                <template #content="{ closeCallback }">
                    <input-text
                    :model-value="list?.name"
                    autofocus
                    class="name-input"
                    @blur="(e) => { updateName((e.target as HTMLInputElement).value); closeCallback() }"
                    @keydown.enter="(e) => (e.target as HTMLInputElement).blur()"
                    fluid
                    />
                </template>
            </inplace> -->
        </div>
        <div class="meta">
            <div>
                <progress-bar :value="value"></progress-bar>
            </div>
            <div>
                 <Inplace>
                    <template #display>
                        <span class="limit-display">{{ totalPoints }} / {{ list?.pointsLimit }} pts</span>
                    </template>
                    <template #content="{ closeCallback }">
                    <input-number
                        :model-value="list?.pointsLimit"
                        :min="250"
                        :step="250"
                        autofocus
                        class="limit-input"
                        @update:model-value="(val: number | null) => val && updatePointsLimit(val)"
                        @blur="() => closeCallback()"
                        fluid
                    />
                    </template>
                </Inplace>
            </div>
           
        </div>
        <div class="sub-title">{{ armyDef?.name }}</div>
        <div class="button" id="list-header-cta"><slot name="button"></slot></div>
    </div>
</template>


<style lang="css" scoped>
    .header {
        display: grid;
        grid-template-columns: 3fr 1fr;
        gap: 0.5rem;
        margin-top: 2rem;
        margin-bottom: 2rem;
    }
    .title {
        font-size: 1.5rem;
    }
    .sub-title {
        text-transform: uppercase;
        font-size: 0.8rem;
    }
</style>