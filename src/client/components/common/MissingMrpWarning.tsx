import React, { ChangeEvent, useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_ITEM } from '../../graphql/mutation/items';
import OverLay from '../OverLay';
import Input from './Inputs/FormInput';
import ErrorMessage from '../Errors/ErrorMessage';
import Tooltip from './Tooltip';
import Icon from './Icon';
import { Card, Heading, Text, Button, IconButton } from '@chakra-ui/react';

const WarningIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="9"
      x2="12"
      y2="13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

export interface MrpWarningItem {
  _id: string;
  name: string;
  category?: string;
  stock: number;
  price?: {
    cost: number;
    sale: number;
    list: number;
  };
}

interface Props {
  item: MrpWarningItem;
  // Fallback prefill if the item's own Sale Price is also unset — the price
  // this particular line was actually sold/bought at.
  fallbackPrice?: number;
  // Called with the updated item after a successful save, so the caller can
  // patch its own local state (item lists, in-progress form data, etc.)
  // instead of refetching or reloading the page.
  onUpdated?: (updated: MrpWarningItem) => void;
}

// Warning icon shown next to items missing an MRP (e.g. legacy stock entered
// with only a Sale Price). Clicking it opens a focused "fix MRP" modal
// instead of sending the user away to the Stock page and losing whatever
// they were doing.
const MissingMrpWarning: React.FC<Props> = ({
  item,
  fallbackPrice,
  onUpdated,
}) => {
  const [submitUpdateItem, { loading }] = useMutation(UPDATE_ITEM);
  const [open, setOpen] = useState(false);
  const [mrp, setMrp] = useState<number | ''>('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (item?.price?.list) {
    return null;
  }

  const openModal = () => {
    setMrp(item.price?.sale || fallbackPrice || 0);
    setSubmitted(false);
    setError('');
    setOpen(true);
  };

  const onSave = async () => {
    setSubmitted(true);
    if (!(Number(mrp) > 0)) {
      setError('Please enter an MRP greater than 0');
      return;
    }
    try {
      const res = await submitUpdateItem({
        variables: {
          _id: item._id,
          name: item.name,
          category: item.category,
          stock: item.stock,
          price: {
            cost: item.price?.cost || 0,
            sale: item.price?.sale || Number(mrp),
            list: Number(mrp),
          },
        },
      });
      onUpdated?.(res.data.updateItem);
      setOpen(false);
    } catch (e) {
      setError(`Error updating MRP. ${e.message}`);
    }
  };

  return (
    <React.Fragment>
      <Tooltip content="Missing MRP">
        <IconButton
          aria-label="Missing MRP"
          size="2xs"
          variant="ghost"
          colorPalette="orange"
          ml={1}
          onClick={openModal}
        >
          <WarningIcon />
        </IconButton>
      </Tooltip>
      <OverLay show={open}>
        <Card.Root mb={0} variant="elevated">
          <Card.Header>
            <Heading size="md">Missing MRP — {item.name}</Heading>
          </Card.Header>
          <Card.Body>
            <ErrorMessage error={error} />
            <Text fontSize="sm" color="fg.muted" mb={3}>
              This item doesn&apos;t have an MRP yet. We&apos;ve filled in its
              sale price below — keep it as the MRP, or edit the field, then
              save.
            </Text>
            <Input
              inputName="mrp"
              inputLabel="MRP"
              inputType="number"
              max={20}
              placeholderValue="MRP"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setMrp(value === '' ? '' : Number(value));
              }}
              disabled={loading}
              isInvalid={submitted && !(Number(mrp) > 0)}
              value={mrp}
            />
          </Card.Body>
          <Card.Footer>
            <Button
              variant="outline"
              colorPalette="red"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              <Icon name="cancel" />
              Cancel
            </Button>
            <Button
              colorPalette="brand"
              ml="auto"
              loading={loading}
              onClick={onSave}
            >
              <Icon name="done" light />
              Save MRP
            </Button>
          </Card.Footer>
        </Card.Root>
      </OverLay>
    </React.Fragment>
  );
};

export default MissingMrpWarning;
