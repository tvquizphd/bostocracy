const to_line_degrees = (angle, step, offset) => {
  const degrees = (
    degrees => degrees > 180 ? degrees - 180 : degrees
  )(
     (360 + offset + 180*angle/Math.PI)%360
  )
  return step*Math.floor(degrees/step);
}
const to_mean_angle = (angles) => {
  const [dy, dx] = angles.reduce(
    ([dy, dx], radians) => ([
      dy + Math.sin(radians), dx + Math.cos(radians)
    ]),
    [0, 0]
  )
  const n = angles.length;
  return Math.atan2(dy/n,dx/n);
}
const to_xy_angle = (stop0, stop1) => {
  const {x: x0, y: y0} = stop0;
  const {x: x1, y: y1} = stop1;
  const dx = x1-x0;
  const dy = y0-y1;
  if (dx === 0 && dy === 0) {
    return 0;
  }
  return Math.atan2(dy,dx);
}

export {
  to_mean_angle, to_xy_angle, to_line_degrees
}
