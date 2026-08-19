import React from 'react';
import { VStack, IconButton, Link as ChakraLink } from '@chakra-ui/react';

interface Props {
  whatsappNumber?: string;
  contactEmail?: string;
  shopName?: string;
}

const WhatsAppIcon: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.87.517 3.622 1.415 5.121L2 22l4.998-1.394A9.958 9.958 0 0 0 12.004 22C17.522 22 22 17.514 22 12.004 22 6.486 17.522 2 12.004 2zm0 18.153a8.1 8.1 0 0 1-4.132-1.13l-.296-.176-3.087.861.827-3.03-.192-.31a8.12 8.12 0 0 1-1.256-4.364c0-4.49 3.653-8.14 8.14-8.14 4.484 0 8.138 3.65 8.138 8.14 0 4.489-3.654 8.15-8.142 8.15z" />
  </svg>
);

const EmailIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
    <path d="M3 6l9 7 9-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Fixed bottom-right contact shortcuts. Only rendered when the shop owner
// has actually filled in the corresponding field in Store Settings - never
// shown as a dead/non-functional button.
const ContactBubbles: React.FC<Props> = ({ whatsappNumber, contactEmail, shopName }) => {
  if (!whatsappNumber && !contactEmail) {
    return null;
  }

  // wa.me requires digits only (no +, spaces, or dashes).
  const digitsOnly = whatsappNumber?.replace(/[^0-9]/g, '');
  const whatsappHref = digitsOnly
    ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(
        `Hi${shopName ? ' ' + shopName : ''}, I'm interested in one of your products.`,
      )}`
    : undefined;

  return (
    <VStack
      position="fixed"
      bottom={{ base: 4, md: 6 }}
      right={{ base: 4, md: 6 }}
      gap={3}
      zIndex="overlay"
      className="hide-in-print"
    >
      {contactEmail && (
        <IconButton
          asChild
          aria-label="Email us"
          size="xl"
          borderRadius="full"
          bg="blue.500"
          _hover={{ bg: 'blue.600' }}
          shadow="lg"
        >
          <ChakraLink href={`mailto:${contactEmail}`}>
            <EmailIcon />
          </ChakraLink>
        </IconButton>
      )}
      {whatsappHref && (
        <IconButton
          asChild
          aria-label="Message us on WhatsApp"
          size="xl"
          borderRadius="full"
          bg="#25D366"
          _hover={{ bg: '#1ebe5a' }}
          shadow="lg"
        >
          <ChakraLink href={whatsappHref} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
          </ChakraLink>
        </IconButton>
      )}
    </VStack>
  );
};

export default ContactBubbles;
