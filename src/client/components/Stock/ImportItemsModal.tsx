import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { BULK_UPDATE_ITEMS_BY_SHORT_ID } from '../../graphql/mutation/items';
import { BulkUpdateItemInput } from '../../generated/graphql';
import OverLay from '../OverLay';
import Icon from '../common/Icon';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';

const BATCH_SIZE = 25;

interface Props {
  rows: BulkUpdateItemInput[];
  onClose: () => void;
  // Called once processing finishes (regardless of outcome) so the caller
  // can refetch its own item list.
  onCompleted?: () => void;
}

interface ErrorRow {
  shortId: string;
  message: string;
}

// Runs a CSV bulk-update in small batches against the server rather than
// one giant call — both so the progress bar reflects real work being
// done, not a guess, and so one bad batch can't take the whole import
// down with it. Shows a summary (updated/not found/errors) once every
// batch has been attempted.
const ImportItemsModal: React.FC<Props> = ({ rows, onClose, onCompleted }) => {
  const [submitBulkUpdate] = useMutation(BULK_UPDATE_ITEMS_BY_SHORT_ID);
  const [processed, setProcessed] = useState(0);
  const [done, setDone] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [notFound, setNotFound] = useState<string[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  // StrictMode/effect re-run guard - this must only ever actually submit
  // the batches once per mount, not once per effect invocation.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }
    hasStarted.current = true;

    const run = async () => {
      let updated = 0;
      const missed: string[] = [];
      const failed: ErrorRow[] = [];

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        try {
          const { data } = await submitBulkUpdate({
            variables: { items: batch },
          });
          const result = data?.bulkUpdateItemsByShortId;
          if (result) {
            updated += result.updated?.length || 0;
            missed.push(...(result.notFound || []));
            failed.push(...(result.errors || []));
          }
        } catch (e) {
          // The whole batch failed at the network/GraphQL level - record
          // every row in it as an error rather than silently dropping them.
          failed.push(
            ...batch.map((row) => ({
              shortId: row.shortId,
              message: `Batch failed: ${e.message}`,
            })),
          );
        }
        setProcessed(Math.min(i + BATCH_SIZE, rows.length));
      }

      setUpdatedCount(updated);
      setNotFound(missed);
      setErrors(failed);
      setDone(true);
      onCompleted?.();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percent = rows.length ? Math.round((processed / rows.length) * 100) : 0;

  return (
    <OverLay show className="hide-in-print">
      <Box p={4}>
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="semibold">
            {done
              ? 'Import complete'
              : 'Importing items… (DO NOT CLOSE THIS WINDOW)'}
          </Text>
          {done && (
            <Button size="sm" variant="outline" onClick={onClose}>
              <Icon name="cancel" />
              Close
            </Button>
          )}
        </HStack>

        {!done && (
          <React.Fragment>
            <Box
              bg="bg.muted"
              borderRadius="full"
              h="12px"
              overflow="hidden"
              mb={2}
            >
              <Box
                bg="brand.solid"
                h="full"
                borderRadius="full"
                width={`${percent}%`}
                transition="width 0.2s"
              />
            </Box>
            <Text textAlign="center" fontSize="sm" color="fg.muted">
              {processed} of {rows.length} rows processed
            </Text>
          </React.Fragment>
        )}

        {done && (
          <VStack align="stretch" gap={4}>
            <HStack justify="space-around" textAlign="center">
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {updatedCount}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  Updated
                </Text>
              </Box>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {notFound.length}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  Not found
                </Text>
              </Box>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  {errors.length}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  Errors
                </Text>
              </Box>
            </HStack>

            {!!notFound.length && (
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb={1}>
                  Short IDs not found in your stock (skipped):
                </Text>
                <Box
                  maxH="120px"
                  overflowY="auto"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l2"
                  p={2}
                >
                  <Text fontSize="xs" color="fg.muted">
                    {notFound.join(', ')}
                  </Text>
                </Box>
              </Box>
            )}

            {!!errors.length && (
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb={1}>
                  Rows rejected:
                </Text>
                <Box
                  maxH="160px"
                  overflowY="auto"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="l2"
                  p={2}
                >
                  <VStack align="stretch" gap={1}>
                    {errors.map((err, i) => (
                      <Text key={i} fontSize="xs" color="red.600">
                        {err.shortId}: {err.message}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              </Box>
            )}

            {!notFound.length && !errors.length && (
              <Text textAlign="center" color="green.600" fontSize="sm">
                Every row updated successfully.
              </Text>
            )}
          </VStack>
        )}
      </Box>
    </OverLay>
  );
};

export default ImportItemsModal;
