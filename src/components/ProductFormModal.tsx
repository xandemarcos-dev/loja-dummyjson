import { useEffect } from 'react';
import { Button, Group, Modal, NumberInput, Select, SimpleGrid, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { productFormSchema, type Category, type ProductFormValues } from '../schemas/product';

export const emptyProductForm: ProductFormValues = {
  title: '',
  description: '',
  category: '',
  brand: '',
  price: 0,
  stock: 0,
};

interface ProductFormModalProps {
  opened: boolean;
  title: string;
  categories: Category[];
  initialValues?: ProductFormValues;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductFormModal({ opened, title, categories, initialValues, onClose, onSubmit }: ProductFormModalProps) {
  const form = useForm<ProductFormValues>({
    mode: 'controlled',
    initialValues: initialValues ?? emptyProductForm,
    validate: zodResolver(productFormSchema),
  });

  // Ao abrir o modal (para criar ou para editar outro produto), recarrega os valores do formulário.
  // `form` é estável entre renders; as dependências reais são a abertura e os valores iniciais.
  const { setValues, resetDirty, clearErrors } = form;
  useEffect(() => {
    if (!opened) return;
    const values = initialValues ?? emptyProductForm;
    setValues(values);
    resetDirty(values);
    clearErrors();
  }, [opened, initialValues, setValues, resetDirty, clearErrors]);

  const handleSubmit = async (values: ProductFormValues) => {
    // O zodResolver valida; aqui o parse também normaliza (trim) antes de enviar.
    await onSubmit(productFormSchema.parse(values));
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg" centered>
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="sm">
          <TextInput label="Nome do produto" withAsterisk data-autofocus {...form.getInputProps('title')} />
          <Textarea label="Descrição" withAsterisk autosize minRows={3} {...form.getInputProps('description')} />
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Select
              label="Categoria"
              withAsterisk
              searchable
              data={categories.map((item) => ({ value: item.slug, label: item.name }))}
              comboboxProps={{ withinPortal: true }}
              {...form.getInputProps('category')}
            />
            <TextInput label="Marca" {...form.getInputProps('brand')} />
            <NumberInput label="Preço (US$)" withAsterisk min={0} decimalScale={2} fixedDecimalScale {...form.getInputProps('price')} />
            <NumberInput label="Estoque" withAsterisk min={0} allowDecimal={false} {...form.getInputProps('stock')} />
          </SimpleGrid>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={form.submitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={form.submitting}>
              Salvar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
