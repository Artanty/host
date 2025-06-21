export interface SetRemoteElementStatePayload {
	remote: string,
	element: any,
	state: any,
	remotes: any[],
	buttons: any[]
}
// export const setProductButtonLoading () {
export const setRemoteElementState = (data: SetRemoteElementStatePayload) => {
	
}