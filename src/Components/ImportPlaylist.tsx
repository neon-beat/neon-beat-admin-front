import { useContext, useState } from "react";
import { Button, Flex, Modal, Upload } from "antd";
import { FaUpload } from "react-icons/fa6";
import MessageContext from "../Context/MessageContext";

const { Dragger } = Upload;

type ImportPlaylistProps<TPayload> = {
  text: string;
  onImport?: (payload: TPayload) => Promise<void>;
};

function ImportPlaylist<TPayload>({ text, onImport }: ImportPlaylistProps<TPayload>) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);

  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('ImportPlaylist must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const handleCancel = () => {
    setModalOpen(false);
  }

  const handleOk = async (file: File) => {
    setImportLoading(true);
    try {
      const text = await file.text();
      const sequenceData = JSON.parse(text) as TPayload;
      await onImport?.(sequenceData);
    } catch (error: unknown) {
      console.log('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') {
        messageApi.error({
          content: `Error importing ${text.toLowerCase()}: ${errorMessage}`,
          duration: 8,
        });
      }
    } finally {
      setImportLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <>
      <Button type="primary" icon={<FaUpload />} onClick={() => setModalOpen((prev) => !prev)}>{text}</Button>
      <Modal
        title={text}
        open={modalOpen}
        onCancel={handleCancel}
        footer={() => null}
        loading={importLoading}
      >
        <Dragger
          name="file"
          multiple={false}
          accept=".json"
          beforeUpload={(file) => {
            handleOk(file);
            return false; // Prevent automatic upload
          }}
          showUploadList={false}
          disabled={importLoading}
        >
          <Flex justify="center" className="ant-upload-drag-icon !mb-2">
            <FaUpload />
          </Flex>
          <p className="ant-upload-text">Click or drag a JSON file to this area to import {text.toLowerCase()}</p>
          <p className="ant-upload-hint">
            The file should be a valid JSON file for {text.toLowerCase()}.
          </p>
        </Dragger>
      </Modal>
    </>
  );
}

export default ImportPlaylist;