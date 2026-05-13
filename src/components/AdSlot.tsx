'use client';

interface AdSlotProps {
  slot?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  label?: string;
}

/**
 * Placeholder de anúncio AdSense.
 * Substitua o conteúdo pelo script real do Google AdSense quando aprovado.
 *
 * Exemplo de integração real:
 * <ins className="adsbygoogle"
 *   style={{ display: 'block' }}
 *   data-ad-client="ca-pub-XXXXXXXX"
 *   data-ad-slot="XXXXXXXX"
 *   data-ad-format="auto"
 *   data-full-width-responsive="true" />
 */
export default function AdSlot({ format = 'horizontal', className = '', label }: AdSlotProps) {
  const heightMap = {
    horizontal: 'min-h-[90px]',
    rectangle: 'min-h-[250px]',
    vertical: 'min-h-[600px]',
  };

  return (
    <div
      className={`ad-slot ${heightMap[format]} w-full my-4 ${className}`}
      role="complementary"
      aria-label={label || 'Anúncio'}
    >
      <span className="text-text-muted text-xs tracking-widest opacity-50">
        {label || 'PUBLICIDADE'}
      </span>
    </div>
  );
}
