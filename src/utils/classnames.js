import { twMerge } from 'tailwind-merge';

export const cn = (...classes) => twMerge(classes.filter(Boolean).join(' '));
