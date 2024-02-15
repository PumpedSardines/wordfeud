function cx(classes: (string | null | boolean | undefined | number)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default cx;
