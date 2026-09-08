/**
 * Progressive blur.
 *
 * Five `backdrop-filter` layers, each masked to a different band, so content
 * scrolling underneath dissolves rather than hitting a hard blur edge. All the
 * blur radii and gradient stops live in `app/globals.css` and are the
 * resource's values unchanged; this component only stacks the layers.
 */
type Props = {
  /** Which edge the blur ramps towards. `top` mirrors the gradients. */
  edge?: "top" | "bottom";
  /** Height of the ramp. The resource ships 15em. */
  height?: string;
  className?: string;
};

export default function ProgressiveBlur({
  edge = "bottom",
  height,
  className,
}: Props) {
  return (
    <div
      className={`progressive-blur${className ? ` ${className}` : ""}`}
      data-edge={edge}
      style={height ? { height } : undefined}
      aria-hidden
    >
      <div className="progressive-blur__layer is--1" />
      <div className="progressive-blur__layer is--2" />
      <div className="progressive-blur__layer is--3" />
      <div className="progressive-blur__layer is--4" />
      <div className="progressive-blur__layer is--5" />
    </div>
  );
}
