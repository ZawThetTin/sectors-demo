import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY } from '@/data';
import { cn } from '@/utils';

export const Button = ({ className, children, variant, ...rest }) => {
	return (
		<button
			className={cn(
				'py-1 px-3 rounded-md border',
				variant === BTN_PRIMARY &&
					'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
				variant === BTN_SECONDARY && 'border-gray-200',
				variant === BTN_DANGER &&
					'bg-red-50 text-red-600 hover:bg-red-100 border-transparent',
				className
			)}
			{...rest}>
			{children}
		</button>
	);
};
