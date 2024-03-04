import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { countriesArray } from './data';
import App from './App.vue';
import AutocompleteInput from './components/AutocompleteInput.vue';

const usernameSelector = '[data-testid=username] input';
const countrySelector = '[data-testid=country] input';
const taxIdSelector = '[data-testid=taxId] input';
const messageSelector = '[data-testid=message]';
const autocompleteSelector = '[data-testid=autocomplete]';

describe('App', () => {
  test('validates username on submit', async () => {
    const wrapper = mount(App);
    await wrapper.find(usernameSelector).setValue('x');
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.find(usernameSelector).classes()).toContain('is-invalid');
    await wrapper.find(usernameSelector).setValue('abc');
    expect(wrapper.find(usernameSelector).classes()).toContain('is-valid');
  });

  test('validates taxId for the US', async () => {
    const wrapper = mount(App);
    await wrapper.find(countrySelector).setValue('United States');
    await wrapper.find(taxIdSelector).setValue('invalid');
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.find(taxIdSelector).classes()).toContain('is-invalid');
    await wrapper.find(taxIdSelector).setValue('1234-WTF-12345');
    expect(wrapper.find(taxIdSelector).classes()).toContain('is-valid');
  });

  test('validates taxId for Canada', async () => {
    const wrapper = mount(App);
    await wrapper.find(countrySelector).setValue('Canada');
    await wrapper.find(taxIdSelector).setValue('invalid');
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.find(taxIdSelector).classes()).toContain('is-invalid');
    await wrapper.find(taxIdSelector).setValue('123456789A-GG');
    expect(wrapper.find(taxIdSelector).classes()).toContain('is-valid');
  });

  test('submits the form and shows the success message', async () => {
    const wrapper = mount(App);

    const result = { status: 200, body: 'Success!' };
    global.fetch = vi.fn().mockReturnValue(
      Promise.resolve(new Response(JSON.stringify(result), { status: 200 }))
    );

    await wrapper.find(usernameSelector).setValue('Sterling Archer');
    await wrapper.find(countrySelector).setValue('United States');
    await wrapper.find(taxIdSelector).setValue('1234-WTF-12345');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    await nextTick();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find(messageSelector).html()).toContain('Success!');
  });

  test('submits the form and shows the error message', async () => {
    const wrapper = mount(App);

    const result = { status: 404, body: 'Error!' };
    global.fetch = vi.fn().mockReturnValue(
      Promise.resolve(new Response(JSON.stringify(result), { status: 404 }))
    );

    await wrapper.find(usernameSelector).setValue('Error');
    await wrapper.find(countrySelector).setValue('United States');
    await wrapper.find(taxIdSelector).setValue('1234-LOL-56789');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    await nextTick();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find(messageSelector).html()).toContain('Error!');
  });
});

describe('AutocompleteInput', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(AutocompleteInput, {
      props: {
        label: "Country",
        autocompleteField: "country",
        items: countriesArray,
        searchValue: ''
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('emits an update when the input changes', async () => {
    await wrapper.find(autocompleteSelector).setValue('Co');

    expect(wrapper.emitted()).toHaveProperty('update:value');
    expect(wrapper.emitted()['update:value'][0]).toEqual(['Co']);
  });

  test('shows the suggestion list', async () => {
    await wrapper.find(autocompleteSelector).setValue('Co');

    expect(wrapper.html()).toContain('Colombia');
  });

  test('press down to pick the second suggestion (downHandler)', async () => {
    await wrapper.find(autocompleteSelector).setValue('United');
    await nextTick();

    await wrapper.find(autocompleteSelector).trigger('keydown.down.prevent');
    await nextTick();

    const listItems = wrapper.findAll('.list-group-item');
    
    expect(listItems[0].classes()).not.toContain('suggestion-active');
    expect(listItems[1].classes()).toContain('suggestion-active');
  });

  test('press down, then up to pick the first suggestion (upHandler)', async () => {
    await wrapper.find(autocompleteSelector).setValue('United');
    await nextTick();

    await wrapper.find(autocompleteSelector).trigger('keydown.down.prevent');
    await nextTick();

    await wrapper.find(autocompleteSelector).trigger('keydown.up.prevent');
    await nextTick();

    const listItems = wrapper.findAll('.list-group-item');
    
    expect(listItems[0].classes()).toContain('suggestion-active');
    expect(listItems[1].classes()).not.toContain('suggestion-active');
  });

  test('press enter to pick the first suggestion (enterHandler)', async () => {
    await wrapper.find(autocompleteSelector).setValue('United');
    await nextTick();

    await wrapper.find(autocompleteSelector).trigger('keydown.enter.prevent');
    await nextTick();

    expect(wrapper.emitted()['update:value'][1]).toEqual(['United States']);
  });

  test('click suggestion list (clickHandler)', async () => {
    await wrapper.find(autocompleteSelector).setValue('New');
    await nextTick();

    const firstOption = wrapper.find('.suggestion-active');
    await firstOption.trigger('click');
    await nextTick();

    expect(wrapper.emitted()['update:value'][1]).toEqual(['New Zealand']);
  });
});
