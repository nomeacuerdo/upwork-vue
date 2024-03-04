<template>
  <div className="form-floating mb-3">
    <input
      :class="{
                'is-valid' : !validInput && submitted,
                'is-invalid' : validInput && submitted,
                inputField
                }"
      :id="inputField"
      :placeholder="label"
      :value="inputValue"
      @input="updateValue"
      class="form-control"
      type="text"
      required
      minLength={3}
    />
    <label :for="inputField">{{ label }}</label>
    <div v-if="validInput" className="invalid-feedback">
      {{ validInput }}
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    props: {
      validInput: String,
      submitted: Boolean,
      inputField: String,
      inputValue: String,
      label: String
    },
    setup(props, { emit }: { emit: (event: string, ...args: any[]) => void }) {
      const updateValue = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        emit('update:value', value);
      }

      return { updateValue }
    }
  }
</script>

<style lang="scss" scoped>

</style>