<template>
  <div class="home container text-center">
      <div class="row justify-content-md-center">
        <div class="col-12">
          <form class='needs-validation' noValidate @submit.prevent="submitForm">
            <form-input
              label="User Name"
              inputField="username"
              :inputValue="username"
              :submitted="submitted"
              :validInput="usernameValid"
              @update:value="username = $event"
              data-testid="username"
            ></form-input>
            
            <autocomplete-input
              label="Country"
              autocompleteField="country"
              :items="countries"
              :searchValue="selectedCountry"
              :validInput="countryValid"
              :submitted="submitted"
              @update:value="selectedCountry = $event"
              data-testid="country"
            ></autocomplete-input>

            <form-input
              label="Tax Identifier"
              inputField="taxId"
              :inputValue="taxId"
              :submitted="submitted"
              :validInput="taxIdValid"
              @update:value="taxId = $event"
              data-testid="taxId"
            ></form-input>

            <div>
              <button type="submit" :disabled="disableSubmit" class="btn btn-primary">Submit</button>
            </div>

          </form>
          <p class='mt-3'>
            <small>
              To test an error case, just use <mark>Error</mark> as an username.
            </small>
          </p>
          <div
            v-if="formMessage"
            class="alert"
            role="alert"
            data-testid="message"
            :class="{
              'alert-success': formSuccess,
              'alert-danger': !formSuccess
            }"
          >
            {{ formMessage }}
          </div>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import { countriesArray } from './data';
import FormInput from './components/FormInput.vue';
import AutocompleteInput from './components/AutocompleteInput.vue';
import { ref, computed } from 'vue';

export default {
  components: {
    FormInput,
    AutocompleteInput
  },
  setup() {
    const countries = ref<string[]>(countriesArray);
    const username = ref<string>('');
    const selectedCountry = ref<string>('');
    const taxId = ref<string>('');
    const formMessage = ref<string>('');
    const submitted = ref<boolean>(false);
    const formSuccess = ref<boolean>(false);
    const disableSubmit = ref<boolean>(false);

    const countryValid = computed(() => countries.value.includes(selectedCountry.value) ? '' : 'Select a valid country');
    const usernameValid = computed(() => username.value.length >= 3 ? '' : 'User name is required, and should be at least 3 characters');
    const taxIdValid = computed(() => {
      if (selectedCountry.value === 'United States') {
        const usRegex = /^\d{4}-[a-zA-Z]{3}-(\d{5}|\d{7})$/;
        return usRegex.test(taxId.value) ? '' : 'You Need a Valid Tax ID';
      } else if (selectedCountry.value === 'Canada') {
        const caRegex = /^[0-9ABD]{10}-[A-Za-z]{2}$/;
        return caRegex.test(taxId.value) ? '' : 'You Need a Valid Tax ID';
      }
      return '';
    });

    

    const submitForm = async () => {
      submitted.value = true;
      formMessage.value = '';
      if (usernameValid.value === '' && countryValid.value === '' && taxIdValid.value === '') {
        disableSubmit.value = true;
        const content = {
          country: selectedCountry.value,
          username: username.value,
          taxId: taxId.value
        };
        // https://app.wiremock.cloud/
        fetch('https://1zle5.wiremockapi.cloud/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(content),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(() => {
            username.value = '';
            taxId.value = '';
            selectedCountry.value = '';
            submitted.value = false;
            formMessage.value = 'Success!';
            formSuccess.value = true;
            disableSubmit.value = false;
          })
          .catch(() => {
            formMessage.value = 'Error!';
            formSuccess.value = false;
            disableSubmit.value = false;
          });
      }
    };

    return {
      countries,
      username,
      selectedCountry,
      taxId,
      submitted,
      formMessage,
      usernameValid,
      countryValid,
      taxIdValid,
      submitForm,
      formSuccess,
      disableSubmit
    };
  },
}
</script>
