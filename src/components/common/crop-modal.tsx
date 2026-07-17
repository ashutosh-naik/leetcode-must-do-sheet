"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";
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
  const [minSize, setMinSize] = useState(80);
  const [maxSize, setMaxSize] = useState(220);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = () => {
      if (cancelled) return;
      onCancel();
    };
    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      const container = containerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = 250;
      const scale = Math.min(cw / img.width, ch / img.height, 1);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const mx = Math.min(dw, dh, 240);
      const mn = Math.max(60, Math.min(dw, dh) * 0.3);
      setMaxSize(mx);
      setMinSize(mn);
      setCropSize(mx);
      setPos({ x: (cw - mx) / 2, y: (ch - mx) / 2 });
      setReady(true);
    };
    img.src = imageSrc;
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const clampPosition = useCallback((nx: number, ny: number, size: number) => {
    const container = containerRef.current;
    if (!container) return { x: nx, y: ny };
    return {
      x: Math.max(0, Math.min(container.clientWidth - size, nx)),
      y: Math.max(0, Math.min(250 - size, ny)),
    };
  }, []);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dragging.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX, y: clientY, startX: pos.x, startY: pos.y };
  }, [pos]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    const next = clampPosition(dragStart.current.startX + dx, dragStart.current.startY + dy, cropSize);
    setPos(next);
  }, [cropSize, clampPosition]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    if (!ready) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ready, onCancel]);

  const handleZoomChange = useCallback((newSize: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cx = pos.x + cropSize / 2;
    const cy = pos.y + cropSize / 2;
    const nx = cx - newSize / 2;
    const ny = cy - newSize / 2;
    const clamped = clampPosition(nx, ny, newSize);
    setCropSize(newSize);
    setPos(clamped);
  }, [pos, cropSize, clampPosition]);

  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;

    const cw = container.clientWidth;
    const ch = 250;
    // Account for object-contain letterboxing
    const scale = Math.min(cw / img.width, ch / img.height, 1);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const offsetX = (cw - dw) / 2;
    const offsetY = (ch - dh) / 2;

    const sx = ((pos.x - offsetX) / dw) * img.width;
    const sy = ((pos.y - offsetY) / dh) * img.height;
    const ss = (cropSize / dw) * img.width;

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Crop photo"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[360px] mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="font-heading text-base font-semibold">Crop Photo</h3>
          <button onClick={onCancel} aria-label="Close" className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-4">
          <div
            ref={containerRef}
            className="relative bg-black rounded-xl overflow-hidden select-none"
            style={{ height: 250 }}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
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
                  onMouseDown={handlePointerDown}
                  onTouchStart={handlePointerDown}
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

          {/* Zoom slider */}
          {ready && (
            <div className="flex items-center gap-2.5 mt-3">
              <ZoomOut className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={minSize}
                max={maxSize}
                value={cropSize}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                aria-label="Zoom level"
                className="flex-1 h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              />
              <ZoomIn className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-1.5">Drag to position &middot; Slider to resize</p>

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

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
