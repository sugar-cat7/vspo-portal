import { useState, useCallback } from "react";

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
