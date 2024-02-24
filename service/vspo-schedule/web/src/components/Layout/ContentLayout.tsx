import * as React from "react";

import { CustomHead } from "../Head/Head";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { GoogleAd } from "../Elements/Google/GoogleAd";
import { CustomBottomNavigation } from "@/components/Layout/Navigation";
import { Breakpoint, Container, ContainerTypeMap } from "@mui/material";
import { styled } from "@mui/material/styles";
import { OverridableComponent } from "@mui/material/OverridableComponent";

type ContentLayoutProps = {
  children: React.ReactNode;
  title: string;
  lastUpdateDate?: string;
  description?: string;
  path?: string;
  canonicalPath?: string;
  footerMessage?: string;
  headTitle?: string;
  maxPageWidth?: Breakpoint;
  padTop?: boolean;
};

type StyledContainerProps = Pick<ContentLayoutProps, "padTop">;

const StyledContainer = styled(Container)<StyledContainerProps>(
  ({ theme, padTop }) => ({
    padding: theme.spacing(3),
    paddingTop: padTop ? theme.spacing(4) : 0,

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      paddingTop: padTop ? theme.spacing(3) : 0,
    },
  }),
) as OverridableComponent<ContainerTypeMap<StyledContainerProps>>;

export const ContentLayout = ({
  children,
  title,
  lastUpdateDate,
  description,
  path,
  canonicalPath,
  footerMessage,
  headTitle,
  maxPageWidth,
  padTop,
}: ContentLayoutProps) => {
  return (
    <>
      <CustomHead
        title={headTitle || title}
        description={description}
        path={path}
        canonicalPath={canonicalPath}
      />
      <Header title={title} />
      <StyledContainer component="main" maxWidth={maxPageWidth} padTop={padTop}>
        {children}
      </StyledContainer>
      <GoogleAd />
      <Footer lastUpdateDate={lastUpdateDate} description={footerMessage} />
      <CustomBottomNavigation />
    </>
  );
};
