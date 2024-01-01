import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  return { isOpen, openModal, closeModal };
};
