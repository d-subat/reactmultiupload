import React, { Component } from "react";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
      drag: false,
      fileList: [],
      progress: [],
      message: "Maximum 10 files / 5mb"
    };
    this.dropRef = React.createRef();
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  //###############################
  //  SAUBER!!!!
  //###############################
  handleFiles = evt => {
    const fileList = evt.target.files
      ? evt.target.files
      : evt.dataTransfer.files;
    this.setState({
      fileList: fileList,
      progress: Array(fileList.length).fill(0)
    });
    if (fileList.length > 10) {
      this.setState({
        message: "Maximum 10 files"
      });
    } else {
      const size =
        Array.from(fileList).reduce((acc, { size }) => acc + size, 0) /
        (1024 * 1024);
      if (size < 10) {
        const date = new Date();
        const today =
          date.getDate() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();
        let uploadQuota = {
          date: today,
          size: Math.round(size),
          files: fileList.length
        };
        console.log(localStorage.getItem("_RestrictUpload"));
        //if (!localStorage.getItem ("_RestrictUpload")) {}
        //else {
        const restrictUpload = JSON.parse(
          window.localStorage.getItem("_RestrictUpload")
        );
        uploadQuota = {
          date: today,
          size: Math.round(size) + restrictUpload.size,
          files: fileList.length + restrictUpload.files
          // }
        };

        console.log(uploadQuota);
        window.localStorage.setItem(
          "_RestrictUpload",
          JSON.stringify(uploadQuota)
        );

        // const restrictUpload = JSON.parse(window.localStorage.getItem ("_RestrictUpload"));

        if (restrictUpload.size > 10) {
          console.log("too many mb");
          this.setState({
            message: "too many mb"
          });
        } else if (restrictUpload.files > 10) {
          console.log("too many files");
          this.setState({
            message: "too many files"
          });
          console.log(restrictUpload.date);
        } else if (restrictUpload.date === today) {
          console.log(restrictUpload.date);
        } else {
          this.setState({
            message: fileList.length + " files / " + Math.round(size) + "mb",
            fileList: fileList,
            progress: Array(fileList.length).fill(0)
          });
        }
      } else {
        this.setState({
          message: "Maximum 10 mb"
        });
      }
    }
  };

  handleList = id => {
    const fileList = Array.from(this.state.fileList).filter(
      (elem, index) => index !== id
    );
    this.setState({
      fileList: fileList,
      progress: Array(fileList.length).fill(0)
    });
  };

  prepareUpload = () => {
    for (let file = 0; file < this.state.fileList.length; file++) {
      this.fileUpload(this.state.fileList[file], file);
    }
  };

  fileUpload = (file, counter) => {
    const URL = "https://diligent-birch.glitch.me/submit/"; //"https://extrackapi.glitch.me/api/fileanalyse" //
    const request = new XMLHttpRequest();
    request.upload.addEventListener(
      "progress",
      event => {
        let percent = Math.round((event.loaded / event.total) * 100);
        let ids = [...this.state.progress]; // create the copy of state array
        ids[counter] = percent; //new value
        this.setState({
          progress: ids
        });
      },
      false
    );
    request.open("POST", URL, true);
    const formData = new FormData();
    //    formData.append('clientip', this.state.clientIp);
    console.log("file" + counter);
    formData.append("file", file, file.name);

    request.send(formData);

    request.addEventListener("loadend", event => {
      this.setState({
        message: request.responseText
      });
      console.log(request.responseText);
    });

    if (
      this.state.fileList.length === counter + 1 &&
      this.state.progress[this.state.fileList.length - 1] === 100
    ) {
      // async await!!
      // ################# hacky way!!!
      setTimeout(
        () =>
          this.setState({
            fileList: [],
            progress: []
          }),
        3000
      );
    }
  };

  handleDragIn = e => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({
        drag: true
      });
    }
  };

  handleDragOut = e => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter = 0;
    this.setState({
      drag: false
    });
  };

  handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      drag: false
    });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleFiles(e);
      //   e.dataTransfer.clearData()
      this.dragCounter = 0;
    }
  };

  componentDidMount() {
    let div = this.dropRef.current;

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
      div.addEventListener(eventName, preventDefaults, false);
    });

    div.addEventListener("dragenter", this.handleDragIn);
    div.addEventListener("dragleave", this.handleDragOut);
    div.addEventListener("dragover", this.handleDrag);
    div.addEventListener("drop", this.handleDrop);
  }
  componentWillUnmount() {
    let div = this.dropRef.current;
    div.removeEventListener("dragenter", this.handleDragIn);
    div.removeEventListener("dragleave", this.handleDragOut);
    div.removeEventListener("dragover", this.handleDrag);
    div.removeEventListener("drop", this.handleDrop);
  }

  render() {
    const { progress, drag, fileList, showModal, message } = this.state;
    return (
      <>
        <div className="App">
          <div className="container">
            <div className="heading">
              
              <span> React Multiple File Upload Progress </span>
              <div onClick={this.toggleModal}> ? </div>
            </div>
            <div className="view">
              <div className="pane">
                <form
                  encType="multipart/form-data"
                  className={drag ? "dragging" : ""}
                  ref={this.dropRef}
                >
                  <label htmlFor="upfile">
                    <span> Drag & drop files here </span>
                    <input
                      onChange={this.handleFiles}
                      type="file"
                      name="upfile"
                      id="upfile"
                      multiple
                    />
                    <SvgIcon name="cloud" />
                    <span> or click to select files. </span>
                  </label>
                </form>
              </div>
            </div>
            <div className="message"> {message} </div>
            {fileList.length <= 0 ? (
              ""
            ) : progress.every(item => {
                return item <= 0;
              }) ? (
              <button className="upload" onPointerDown={this.prepareUpload}>
                
                <SvgIcon name="upload" /> Upload
              </button>
            ) : progress.every(item => {
                return item === 100;
              }) ? (
              <SvgIcon name="done" color="white" />
            ) : (
              <SvgIcon name="process" color="white" />
            )}
          </div>
          {fileList.length >= 1 && (
            <FileList
              fileList={fileList}
              progress={progress}
              handleList={this.handleList}
            />
          )}
        </div>
        {showModal && <ModalHelp triggerModal={this.toggleModal} />}
      </>
    );
  }
}

const previewFile = file => {
  const allowedExt = [".jpg", ".gif", ".png", ".svg"];
  const fileExt = file.name.match(/\.(\w)*/);
  let url =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIzMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMycHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzkyOTI5MiIgaWQ9Imljb24tNTQtZG9jdW1lbnQiPjxwYXRoIGQ9Ik0xOS41LDMgTDkuMDAyNzYwMTMsMyBDNy44OTY2NjYyNSwzIDcsMy44OTgzMzgzMiA3LDUuMDA3MzI5OTQgTDcsMjcuOTkyNjcwMSBDNywyOS4xMDEyODc4IDcuODkwOTI1MzksMzAgOC45OTc0MjE5MSwzMCBMMjQuMDAyNTc4MSwzMCBDMjUuMTA1NzIzOCwzMCAyNiwyOS4xMDE3ODc2IDI2LDI4LjAwOTIwNDkgTDI2LDEwLjUgTDI2LDEwIEwyMCwzIEwxOS41LDMgTDE5LjUsMyBMMTkuNSwzIFogTTE5LDQgTDguOTk1NTc3NSw0IEM4LjQ0NTczNTIzLDQgOCw0LjQ1NTI2Mjg4IDgsNC45OTU0NTcwMyBMOCwyOC4wMDQ1NDMgQzgsMjguNTU0MzE4NyA4LjQ1NDcwODkzLDI5IDguOTk5OTYwMiwyOSBMMjQuMDAwMDM5OCwyOSBDMjQuNTUyMzAyNiwyOSAyNSwyOC41NTUwNTM3IDI1LDI4LjAwNjYwMjMgTDI1LDExIEwyMC45OTc5MTMxLDExIEMxOS44OTQ0OTYyLDExIDE5LDEwLjExMzQ0NTIgMTksOC45OTQwODA5NSBMMTksNCBMMTksNCBaIE0yMCw0LjUgTDIwLDguOTkxMjE1MjMgQzIwLDkuNTQ4MzUxNjcgMjAuNDUwNjUxMSwxMCAyMC45OTY3Mzg4LDEwIEwyNC42OTk5NTEyLDEwIEwyMCw0LjUgTDIwLDQuNSBaIiBpZD0iZG9jdW1lbnQiLz48L2c+PC9nPjwvc3ZnPg==";
  allowedExt.forEach(element => {
    if (element === fileExt[0]) {
      url = URL.createObjectURL(file);
    }
  });
  return url;
  // check for image!!
};

const FileList = props => {
  const { progress, fileList, handleList } = props;
  return (
    <div
      className={
        progress.every(item => {
          return item === 100;
        })
          ? "outputView done"
          : "outputView out"
      }
    >
      
      {Array.from(props.fileList).map((item, index) => {
        return (
          <div
            className={fileList.length >= 1 ? "fileList blendIn" : "fileList"}
            key={index}
            style={{
              animationDelay: 0.1 * (index + 1) + "s"
            }}
          >
            <ProgressBar
              id={`p${index}`}
              progressValue={progress ? progress[index] : null}
            />
            <span>
              
              <img
                src={previewFile(item)}
                alt={item.name}
                width="32"
                style={{
                  maxHeight: "3em"
                }}
              />
            </span>
            <span>
              
              {item.name.length > 35
                ? item.name.substr(0, 35) + "..."
                : item.name}
            </span>
            {item.size >= 1000
              ? parseInt(item.size / 1000, 10) + "kB"
              : item.size + "B"}
            {progress && progress[index] <= 0 ? (
              <div className="btn" onPointerDown={() => handleList(index)}>
                
                <SvgIcon name="close" />
              </div>
            ) : progress && progress[index] === 100 ? (
              <SvgIcon name="done" />
            ) : (
              <SvgIcon name="process" color="black" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const ProgressBar = props => {
  return (
    <div
      id={props.id}
      className="progressFile"
      style={{
        width: props.progressValue + "%"
      }}
    >
      
    </div>
  );
};

const ModalHelp = props => {
  return (
    <div className="pop">
      <div className="dialog">
        <h2> Help </h2>
        <button className="btn" onPointerDown={props.triggerModal}>
          
          <SvgIcon name="close" color="white" />
        </button>
        <div>
          <h3> Restrictions / Quota for this demo: </h3>
          <ol>
            <li> 10 files per day </li>
            <li> 5 mb maximum upload size per day </li> <li> </li>
          </ol>
          This demo is using glitch.com for upload.
        </div>
      </div>
    </div>
  );
};

const SvgIcon = props => {
  const ICONS = {
    upload: {
      viewBox: "0 0 32 32",
      path:
        "M22.5 10.5c-0.829 0-1.5 0.672-1.5 1.5v9h-18v-9c0-0.828-0.671-1.5-1.5-1.5s-1.5 0.672-1.5 1.5v10.5c0 0.828 0.671 1.5 1.5 1.5h21c0.829 0 1.5-0.672 1.5-1.5v-10.5c0-0.828-0.671-1.5-1.5-1.5zM10.5 15c0 0.828 0.671 1.5 1.5 1.5s1.5-0.672 1.5-1.5v-9h4.5l-6-6-6 6h4.5v9z"
    },
    cloud: {
      viewBox: "0 0 24 24",
      path:
        "M14.016 12.984h3l-5.016-4.969-5.016 4.969h3v4.031h4.031v-4.031zM19.359 10.031c2.578 0.188 4.641 2.344 4.641 4.969 0 2.766-2.25 5.016-5.016 5.016h-12.984c-3.328 0-6-2.672-6-6 0-3.094 2.344-5.625 5.344-5.953 1.266-2.391 3.75-4.078 6.656-4.078 3.656 0 6.656 2.578 7.359 6.047z"
    },
    close: {
      viewBox: "0 0 24 24",
      path:
        "M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z"
    },
    file: {
      viewBox: "0 0 21 24",
      path:
        "M19.661 5.089c0.496 0.496 0.911 1.487 0.911 2.196v15.429c0 0.71-0.576 1.286-1.286 1.286h-18c-0.71 0-1.286-0.576-1.286-1.286v-21.429c0-0.71 0.576-1.286 1.286-1.286h12c0.71 0 1.701 0.415 2.196 0.911zM13.714 1.821v5.036h5.036c-0.080-0.228-0.201-0.455-0.295-0.549l-4.192-4.192c-0.094-0.094-0.321-0.214-0.549-0.295zM18.857 22.286v-13.714h-5.571c-0.71 0-1.286-0.576-1.286-1.286v-5.571h-10.286v20.571h17.143z"
    },
    done: {
      viewBox: "0 0 24 24",
      path:
        "M9.984 17.016l6.609-6.609-1.406-1.406-5.203 5.156-2.063-2.063-1.406 1.406zM19.359 10.031c2.578 0.188 4.641 2.344 4.641 4.969 0 2.766-2.25 5.016-5.016 5.016h-12.984c-3.328 0-6-2.672-6-6 0-3.094 2.344-5.625 5.344-5.953 1.266-2.391 3.75-4.078 6.656-4.078 3.656 0 6.656 2.578 7.359 6.047z"
    },
    process: {
      viewBox: "0 0 24 24",
      path:
        "M18.375 21c0.206 0 0.375 0.168 0.375 0.375s0 1.125 0 1.125h-14.25c0 0 0-0.918 0-1.125s0.168-0.375 0.375-0.375h1.252c0.062-4.994 3.324-6.603 3.324-8.621 0-2.029-3.322-2.164-3.353-8.629h-1.223c-0.207 0-0.375-0.168-0.375-0.375s0-1.125 0-1.125h14.25c0 0 0 0.918 0 1.125s-0.169 0.375-0.375 0.375h-1.148c-0.032 6.465-3.353 6.6-3.353 8.629 0 2.018 3.262 3.628 3.325 8.621h1.176zM12.833 12.379c0-2.037 3.323-2.164 3.353-8.629h-9.047c0.031 6.465 3.353 6.592 3.353 8.629 0 1.958-3.263 3.609-3.325 8.621h0.569c0.134-0.445 0.577-0.98 1.342-1.375l0.995-0.508c0.626-0.323 1.001-0.541 1.125-0.654s0.265-0.364 0.423-0.756c0.166 0.391 0.308 0.643 0.427 0.756s0.491 0.331 1.113 0.654l0.99 0.508c0.761 0.396 1.203 0.931 1.334 1.375h0.671c-0.062-5.012-3.324-6.663-3.324-8.621zM12.053 11.278c-0.090 0.177-0.166 0.514-0.226 1.010-0.015 0.15-0.048 0.376-0.101 0.677-0.053-0.301-0.086-0.526-0.101-0.677-0.061-0.497-0.136-0.832-0.227-1.010-0.091-0.176-0.347-0.494-0.769-0.953l-0.938-1.026c-0.641-0.691-1.052-1.188-1.233-1.488 1.113 0.709 2.2 1.063 3.26 1.063s2.151-0.355 3.271-1.063c-0.188 0.3-0.6 0.796-1.237 1.488l-0.934 1.026c-0.42 0.46-0.676 0.777-0.765 0.953z"
    }
  };

  return (
    <svg
      className={"icon-" + props.name}
      style={{
        fill: props.color
      }}
      viewBox={ICONS[props.name].viewBox}
    >
      <path d={ICONS[props.name].path} />
    </svg>
  );
};

export default App;
