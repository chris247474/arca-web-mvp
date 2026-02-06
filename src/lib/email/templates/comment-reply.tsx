import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Section,
} from "@react-email/components";

export interface CommentReplyEmailProps {
  recipientName: string;
  replierName: string;
  dealName: string;
  replyPreview: string;
  viewUrl: string;
}

export function CommentReplyEmail({
  recipientName,
  replierName,
  dealName,
  replyPreview,
  viewUrl,
}: CommentReplyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>New Reply to Your Comment</Text>

          <Text style={styles.text}>Hi {recipientName},</Text>

          <Text style={styles.text}>
            <strong>{replierName}</strong> replied to your comment on{" "}
            <strong>{dealName}</strong>.
          </Text>

          <Hr style={styles.hr} />

          <Section style={styles.replyBox}>
            <Text style={styles.replyPreview}>"{replyPreview}"</Text>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.buttonSection}>
            <Button style={styles.button} href={viewUrl}>
              View Reply
            </Button>
          </Section>

          <Text style={styles.footer}>
            You are receiving this because someone replied to your comment.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "560px",
    borderRadius: "8px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    color: "#1a1a1a",
    margin: "0 0 30px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#4a4a4a",
    margin: "0 0 16px",
  },
  hr: {
    borderColor: "#e6e6e6",
    margin: "24px 0",
  },
  replyBox: {
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    padding: "16px",
    borderLeft: "4px solid #8b5cf6",
  },
  replyPreview: {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#374151",
    margin: "0",
    fontStyle: "italic" as const,
  },
  buttonSection: {
    textAlign: "center" as const,
    margin: "24px 0",
  },
  button: {
    backgroundColor: "#8b5cf6",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    padding: "12px 24px",
  },
  footer: {
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center" as const,
    margin: "24px 0 0",
  },
};

export default CommentReplyEmail;
