<template>
  <div className="form-floating mb-3">
    <input
      :class="{
                'is-valid' : !validInput && submitted,
                'is-invalid' : validInput && submitted,
                autocompleteField
              }"
      :id="autocompleteField"
      :value="searchValue"
      :placeholder="label"
      @input="updateSearch"
      @keydown.up.prevent="upHandler"
      @keydown.down.prevent="downHandler"
      @keydown.enter.prevent="enterHandler"
      class="suggestions--input form-control"
      type="text"
      data-testid="autocomplete"
    />
    <label class="form-label" :for="autocompleteField">{{ label }}</label>
    <div v-if="validInput" className="invalid-feedback">
      {{ validInput }}
    </div>
    <div
      v-show="openSuggestions && searchResults.length > 0"
      class="suggestions--list has-suggestions"
    >
      <ul className="list-group">
        <li
          class="list-group-item"
          :class="{ 'suggestion-active': i === activeResult }"
          v-for="(result, i) in searchResults"
          :key="i"
          @click="clickHandler(result)"
        >
          {{ result }}
        </li>
      </ul>
    </div>
    <div
      v-show="openSuggestions && searchResults.length === 0"
      class="suggestions--list list-group no-suggestions"
    >
      <em class="list-group-item">No Suggestions</em>
    </div>
  </div>
</template>

<script lang="ts">
  import { ref } from 'vue';

  export default {
    props: {
      label: String,
      autocompleteField: String,
      validInput: String,
      submitted: Boolean,
      searchValue: {
        type: String,
        required: true
      },
      items: {
        type: Array as () => string[],
        required: true
      }
    },
    setup(props: { items: string[], searchValue: string }, { emit }: { emit: (event: string, ...args: any[]) => void }) {
      const searchResults = ref<string[]>([]);
      const openSuggestions = ref<boolean>(false);
      const activeResult = ref<number>(0);

      const updateSearch = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        emit('update:value', value);
        openSuggestions.value = value.length > 0;

        searchResults.value = props.items.filter((item: string) =>
          item.toLowerCase().includes(value.toLowerCase())
        );
      };

      const upHandler = () => {
        if (activeResult.value > 0) {
          activeResult.value--;
        }
      };

      const downHandler = () => {
        if (activeResult.value < searchResults.value.length - 1) {
          activeResult.value++;
        }
      };

      const enterHandler = () => {
        selectResult(searchResults.value[activeResult.value]);
        openSuggestions.value = false;
      };

      const clickHandler = (result: string) => {
        selectResult(result);
        openSuggestions.value = false;
      };

      const selectResult = (result: string) => {
        emit('update:value', result);
      };

      return {
        searchResults,
        openSuggestions,
        activeResult,
        updateSearch,
        upHandler,
        downHandler,
        enterHandler,
        clickHandler,
        selectResult
      };
    }
  };
</script>

<style scoped>
  .suggestions--list {
    height: auto;
    padding: 1rem 0rem;
  }

  .suggestions--list ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .suggestions--list li {
    cursor: pointer;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
  }

  .suggestions--list li:hover {
    background-color: #666;
  }

  .suggestions--list li.suggestion-active {
    background-color: black;
  }
  .no-suggestions {
    font-size: 1rem;
    font-style: italic;
  }
</style>
