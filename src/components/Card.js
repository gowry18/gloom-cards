import React from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import './Card.css'

export const HandStatus = {
	NOT_IN_HAND: 'not-in-hand',
	IN_HAND: 'in-hand',
	ACTIVE: 'active',
	DISCARD: 'discard',
	LOST: 'lost'
}

const cardSource = {
	beginDrag: (props) => {
		return {
			id: props.id,
			index: props.index,
		}
	},
}

const cardTarget = {
	hover: (props, monitor, component) => {
		if (!component) {
			return null
		}
		const dragIndex = monitor.getItem().index
		const hoverIndex = props.index

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return
		}


		// Determine rectangle on screen
		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

		// Determine mouse position
		const clientOffset = monitor.getSourceClientOffset()

		// Get pixels to the top
		const hoverClientY = (clientOffset).top - hoverBoundingRect.top

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%

		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return
		}

		// Time to actually perform the action
		props.moveCard(dragIndex, hoverIndex)

		// Note: we're mutating the monitor item here!
		// Generally it's better to avoid mutations,
		// but it's good here for the sake of performance
		// to avoid expensive index searches.
		monitor.getItem().index = hoverIndex
	}
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

function collectTarget(connect, monitor) {
	return { connectDropTarget: connect.dropTarget() }
}

const Card = ({
	isDragging,
	connectDragSource,
	connectDropTarget,
	character,
	id,
	index,
	showToggle,
	visible,
	handStatus,
	toggleCard,
	toggleHandStatus
}) => {
	if (!showToggle && !visible) return false;
  return connectDragSource(connectDropTarget(
    <div className={`card ${visible ? '' : 'card--hidden'} ${isDragging ? 'card--dragged' : ''} ${handStatus === HandStatus.NOT_IN_HAND || handStatus === HandStatus.IN_HAND ? '' : 'card--' + handStatus}`}>
			{ showToggle ? (
				<label className={`cardToggle ${visible ? 'cardToggleChecked' : ''}`}>
					<input
						type="checkbox"
						defaultChecked={true}
						checked={visible ? true : false}
						onClick={(index) => toggleCard(index)}
						/>
				</label>
			) : (
				<label className={`handToggle ${visible ? 'cardToggleChecked' : ''}`}>
				</label>
			)
		}
		{ isDragging || !visible || handStatus === HandStatus.NOT_IN_HAND ? (
				<img src={`cards/${character}-${id}.jpg`} alt="" />
			) : (
				<img src={`cards/${character}-${id}.jpg`} alt="" onDoubleClick={(index) => toggleHandStatus(index)} />
			)
		}
    </div>
  ));
}
export default DropTarget("card", cardTarget, collectTarget)(DragSource("card", cardSource, collect)(Card));
