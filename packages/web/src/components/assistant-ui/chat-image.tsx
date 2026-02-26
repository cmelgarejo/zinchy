"use client";

import type { FC } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ChatImageProps {
  image: string;
}

export const ChatImage: FC<ChatImageProps> = ({ image }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={image}
          alt="Shared image"
          className="my-2 max-h-64 max-w-sm cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
        />
      </DialogTrigger>
      <DialogContent className="p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-foreground/60 [&>button]:p-1 [&>button]:opacity-100 [&>button]:ring-0! [&_svg]:text-background [&>button]:hover:[&_svg]:text-destructive">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden bg-background">
          <img
            src={image}
            alt="Image preview"
            className="block h-auto max-h-[80vh] w-auto max-w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
