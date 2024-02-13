import { EmbedModeContext } from "@/context/EmbedMode"; // ファイルパスは適宜修正してください
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useContext } from "react";
import { Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

const MaterialUISwitch = styled(Switch)({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb": {
        backgroundColor: "#3f51b5", // モダンな色彩
      },
      "& + .MuiSwitch-track": {
        backgroundColor: "#303f9f", // モダンな色彩
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 32,
    height: 32,
    borderRadius: "50%", // 丸みをつける
    backgroundColor: "#7986cb", // モダンな色彩
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    backgroundColor: "#5c6bc0", // モダンな色彩
  },
});

export const EmbedModeToggleButton: React.FC = () => {
  const [isEmbedMode, setIsEmbedMode] = useContext(EmbedModeContext);

  const handleModeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setIsEmbedMode(checked);
  };
  const label = "視聴モード: " + (isEmbedMode ? "動画" : "リンク");
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <MaterialUISwitch checked={isEmbedMode} onChange={handleModeChange} />
        }
        label={label}
      />
    </FormGroup>
  );
};
