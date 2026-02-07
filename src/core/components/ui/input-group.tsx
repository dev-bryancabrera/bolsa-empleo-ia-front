export const InputGroup = ({ children }: any) => (
    <div className="relative flex items-center">{children}</div>
)

export const InputGroupInput = (props: any) => (
    <input
        {...props}
        className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
    />
)

export const InputGroupAddon = ({ children }: any) => (
    <div className="absolute right-1">{children}</div>
)

export const InputGroupButton = ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
)
