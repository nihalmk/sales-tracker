import React, { useEffect, useState, ChangeEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_SHOP_SETTINGS } from '../../graphql/query/shop';
import { UPDATE_SHOP_SETTINGS } from '../../graphql/mutation/shop';
import { Shop } from '../../generated/graphql';
import Input from '../common/Inputs/FormInput';
import SuccessMessage from '../Alerts/SuccessMessage';
import ErrorMessage from '../Errors/ErrorMessage';
import Loader from '../Loaders/Loader';
import {
  Card,
  Heading,
  Text,
  Stack,
  Button,
  HStack,
  Switch,
  Clipboard,
  Alert,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Icon from '../common/Icon';

interface Props {}

const StoreSettings: React.FC<Props> = () => {
  const { data, loading: loadingShop } = useQuery(GET_SHOP_SETTINGS, {
    fetchPolicy: 'no-cache',
  });
  const [submit, { loading: saving }] = useMutation(UPDATE_SHOP_SETTINGS);

  const [form, setForm] = useState<Partial<Shop>>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data?.getShopForUser && !form) {
      setForm(data.getShopForUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const publicUrl =
    typeof window !== 'undefined' && form?.slug
      ? `${window.location.origin}/store/${form.slug}`
      : '';

  const onSave = async (e?: React.SyntheticEvent) => {
    e && e.preventDefault();
    try {
      const { data: result } = await submit({
        variables: {
          whatsappNumber: form?.whatsappNumber || undefined,
          contactEmail: form?.contactEmail || undefined,
          tagline: form?.tagline || undefined,
          isPublished: !!form?.isPublished,
        },
      });
      setForm((current) => ({
        ...current,
        ...result?.updateShopSettings,
      }));
      setMessage('Store settings saved');
      setTimeout(() => setMessage(''), 5000);
    } catch (e) {
      setError(`Error saving store settings. ${e.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loadingShop && !form) {
    return <Loader />;
  }

  return (
    <Card.Root variant="elevated" borderRadius="l3">
      <Card.Header>
        <HStack gap={2}>
          <Icon name="shop" boxSize={5} />
          <Heading size="md">Online Store</Heading>
        </HStack>
      </Card.Header>
      <form onSubmit={onSave}>
        <Card.Body>
          <Stack gap={4}>
            <Text fontSize="sm" color="fg.muted">
              Your customers can browse your in-stock items, see prices and
              offers, and reach you on WhatsApp or email — all from a public
              page you can share anywhere.
            </Text>

            {publicUrl && (
              <Alert.Root
                status={form?.isPublished ? 'success' : 'info'}
                borderRadius="l2"
              >
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    <Stack gap={2}>
                      <Text fontSize="sm">
                        {form?.isPublished
                          ? 'Your store is live at:'
                          : 'Your store link (turn on "Publish store" below to go live):'}
                      </Text>
                      <Clipboard.Root value={publicUrl}>
                        <HStack>
                          <ChakraLink
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            fontWeight="semibold"
                            wordBreak="break-all"
                          >
                            {publicUrl}
                          </ChakraLink>
                          {/* @ts-expect-error Chakra v3's Ark UI-derived ClipboardTriggerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
                          <Clipboard.Trigger asChild>
                            <Button size="xs" variant="outline">
                              <Clipboard.Indicator />
                              Copy
                            </Button>
                          </Clipboard.Trigger>
                        </HStack>
                      </Clipboard.Root>
                    </Stack>
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            <Input
              tabIndex={1}
              inputName="tagline"
              inputLabel="Tagline (optional)"
              inputType="text"
              max={100}
              placeholderValue="e.g. Your one-stop shop for mobile accessories"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const tagline = e.target.value;
                setForm((current) => ({ ...current, tagline }));
              }}
              disabled={saving}
              value={form?.tagline || ''}
            />
            <Input
              tabIndex={2}
              inputName="whatsappNumber"
              inputLabel="WhatsApp Number"
              inputType="tel"
              max={20}
              placeholderValue="e.g. 919876543210 (country code, no + or spaces)"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const whatsappNumber = e.target.value;
                setForm((current) => ({ ...current, whatsappNumber }));
              }}
              disabled={saving}
              value={form?.whatsappNumber || ''}
            />
            <Input
              tabIndex={3}
              inputName="contactEmail"
              inputLabel="Contact Email"
              inputType="email"
              max={100}
              placeholderValue="e.g. yourshop@example.com"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const contactEmail = e.target.value;
                setForm((current) => ({ ...current, contactEmail }));
              }}
              disabled={saving}
              value={form?.contactEmail || ''}
            />

            <Switch.Root
              checked={!!form?.isPublished}
              onCheckedChange={(details: { checked: boolean }) =>
                setForm((current) => ({
                  ...current,
                  isPublished: details.checked,
                }))
              }
              disabled={saving}
              colorPalette="brand"
            >
              <Switch.HiddenInput />
              {/* @ts-expect-error Chakra v3's Ark UI-derived SwitchControlProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              {/* @ts-expect-error Chakra v3's Ark UI-derived SwitchLabelProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Switch.Label>
                Publish store (make it publicly visible)
              </Switch.Label>
            </Switch.Root>
          </Stack>
          <button type="submit" hidden></button>
        </Card.Body>
      </form>
      <Card.Footer flexDir="column" alignItems="stretch" gap={3}>
        <SuccessMessage message={message} />
        <ErrorMessage error={error} />
        <HStack w="full">
          <Button
            colorPalette="brand"
            ml="auto"
            loading={saving}
            onClick={onSave}
          >
            <Icon name="done" light />
            Save
          </Button>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
};

export default StoreSettings;
