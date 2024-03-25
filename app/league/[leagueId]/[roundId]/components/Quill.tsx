import dynamic from "next/dynamic";

import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const writingModules = {
  toolbar: [
    // Specify the toolbar options you want to include
    ["bold", "italic", "underline", "strike"], // Text formatting options
    [{ header: 1 }, { header: 2 }], // Headers
    [{ list: "ordered" }, { list: "bullet" }], // Lists
    [{ indent: "-1" }, { indent: "+1" }], // Indents
    ["clean"],
  ],
};
const readingModules = { toolbar: false };

export { ReactQuill, writingModules, readingModules };
