import { Alert, IconButton, Snackbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const latestNewsMessage = (
  <>
    [お知らせ]
    <br />
    配信情報を通知するDiscord Botを公開しました！
    <br />
    サイドバーから追加できます。
  </>
);

const StyledAlert = styled(Alert)({
  backgroundColor: "#e5f6fd",
  color: "#014361",
});

type AlertSnackbarProps = {
  open: boolean;
  onClose: () => void;
};

export const AlertSnackbar: React.FC<AlertSnackbarProps> = ({
  open,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      sx={{ marginTop: "48px" }}
    >
      <StyledAlert
        severity="info"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {latestNewsMessage}
      </StyledAlert>
    </Snackbar>
  );
};
