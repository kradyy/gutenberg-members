import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function SortableItem(props) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const {
		selectedSocialMediaIconIndex,
		isSelected,
		index,
		setSelectedSocialMediaIconIndex,
		item,
	} = props;

	return (
		<li
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			style={style}
			className={
				isSelected && selectedSocialMediaIconIndex === index
					? 'selected'
					: null
			}
		>
			<button
				onClick={() =>
					setSelectedSocialMediaIconIndex((e) => {
						return e === index ? undefined : index;
					})
				}
				aria-label={__('Add an icon', 'team-members')}
			>
				<Icon icon={item.icon} />
			</button>
		</li>
	);
}
