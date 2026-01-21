import { BusEvent } from "typlib"

export const filterOutSseEvents = (busEvent: BusEvent) => {
	return busEvent.event !== 'SSE_DATA'
}