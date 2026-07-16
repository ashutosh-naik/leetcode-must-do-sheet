"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CropModalProps {
  imageSrc: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
}

export function CropModal({ imageSrc, onCrop, onCancel }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [cropSize, setCropSize] = useState(200);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const container = containerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = 250;
      const scale = Math.min(cw / img.width, ch / img.height, 1);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const cs = Math.min(dw, dh, 220);
      setCropSize(cs);
      setPos({ x: (cw - cs) / 2, y: (ch - cs) / 2 });
      setReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, startX: pos.x, startY: pos.y };
  }, [pos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const container = containerRef.current;
    if (!container) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const nx = Math.max(0, Math.min(container.clientWidth - cropSize, dragStart.current.startX + dx));
    const ny = Math.max(0, Math.min(250 - cropSize, dragStart.current.startY + dy));
    setPos({ x: nx, y: ny });
  }, [cropSize]);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;

    const cw = container.clientWidth;
    const ch = 250;
    const sx = (pos.x / cw) * img.width;
    const sy = (pos.y / ch) * img.height;
    const ss = (cropSize / cw) * img.width;

    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, sx, sy, ss, ss, 0, 0, 400, 400);

    onCrop(canvas.toDataURL("image/jpeg", 0.85));
  }, [pos, cropSize, onCrop]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[360px] mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="font-heading text-base font-semibold">Crop Photo</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-4">
          <div
            ref={containerRef}
            className="relative bg-black rounded-xl overflow-hidden select-none"
            style={{ height: 250 }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {ready && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Crop"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                <div
                  className="absolute border-2 border-white rounded-full cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                  style={{ width: cropSize, height: cropSize, left: pos.x, top: pos.y }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute inset-0 border border-white/30 rounded-full pointer-events-none" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30 pointer-events-none" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30 pointer-events-none" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none" />
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">Drag to position the crop area</p>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 cursor-pointer">
              Cancel
            </Button>
            <Button size="sm" onClick={handleCrop} disabled={!ready} className="flex-1 bg-primary hover:bg-primary/90 text-white cursor-pointer gap-1">
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
