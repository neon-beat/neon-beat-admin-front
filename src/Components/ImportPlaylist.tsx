import React, { useContext, useState } from "react";
import { Button, Flex, Modal, Upload } from "antd";
import { FaUpload } from "react-icons/fa6";
import MessageContext from "../Context/MessageContext";
import type { Playlist } from "../Hooks/useNeonBeatGames";

const { Dragger } = Upload;

function ImportPlaylist({ onImport }: { onImport?: (payload: Playlist) => Promise<void> }) {
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
      console.log(file);
      const text = await file.text();
      const playlistData = JSON.parse(text);

      const payload: Playlist = {
        ...playlistData
      }
      await onImport?.(payload);
    } catch (error: unknown) {
      console.log('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      messageApi.error(`Error importing playlist: ${errorMessage}`);
    } finally {
      setImportLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <>
      <Button type="primary" icon={<FaUpload />} onClick={() => setModalOpen((prev) => !prev)} />
      <Modal
        title="Import Playlist"
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
          <p className="ant-upload-text">Click or drag JSON file to this area to import playlist</p>
          <p className="ant-upload-hint">
            The file should be a valid JSON playlist file.
          </p>
        </Dragger>
      </Modal>
    </>
  );
}

export default ImportPlaylist;