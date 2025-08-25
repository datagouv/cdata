const prose = 'prose prose-neutral max-w-none prose-strong:text-gray-plain'
const proseSm = 'prose-p:text-sm prose-sm'
const proseTable = 'prose-table:bg-gray-some prose-table:overflow-visible prose-thead:border-b-2 prose-thead:border-black prose-tr:data-[is-header=true]:border-b-2 prose-tr:data-[is-header=true]:border-black prose-tr:even:bg-gray-lower prose-tr:border-b-0 *:prose-th:m-0 *:prose-td:m-0 prose-th:p-4 prose-td:p-4'
const proseHeading = 'prose-h2:text-2xl prose-h2:leading-7 prose-h3:text-xl prose-h3:leading-6 prose-h4:text-base prose-h5:text-sm prose-h5:leading-6 prose-headings:font-extrabold'
const proseList = 'prose-ul:list-disc'
const proseCode = 'prose-pre:font-mono prose-pre:bg-neutral-200 prose-pre:text-neutral-600'
const proseOthers = 'prose-blockquote:border-neutral-800 prose-a:no-underline prose-a:text-gray-plain prose-a:font-[number:inherit] prose-li:p-0 *:prose-li:m-0'

export const markdownClasses = [prose, proseTable, proseHeading, proseList, proseCode, proseOthers].join(' ')
export const markdownSmClasses = [markdownClasses, proseSm].join(' ')
export const markdownTableEditorCLasses = 'prose-table:bg-neutral-200 prose-tr:data-[is-header=true]:border-b-2 prose-tr:data-[is-header=true]:border-black prose-tr:even:bg-neutral-200 prose-tr:odd:bg-neutral-300'
