import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEditor, useDebounce } from './hooks.js';
import { useAuth, useSnippets } from '../../hooks';
import classes from './Editor.module.css';
import { actions } from '../../slices/index.js';
import routes from '../../routes.js';

function AuthBanner() {
  const { t } = useTranslation();

  return (
    <div className={`text-center fw-bold ${classes.banner}`}>
      {t('editor.authBanner')}
    </div>
  );
}

export function MonacoEditor() {
  const [snippetData, setSnippetData] = useState({});
  const { code, language, onChange } = useEditor();
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const snippetApi = useSnippets();
  const params = useParams();
  const snippetParams = {
    login: params.login,
    slug: params.slug,
  };
  const ifHasViewSnippetParams = snippetApi.hasViewSnippetParams(snippetParams);
  const options = {
    selectOnLineNumbers: true,
    wordWrap: true,
    readOnly: !isLoggedIn,
  };

  const snippetDataRef = useRef();

  useEffect(() => {
    snippetDataRef.current = snippetData;
  }, [snippetData]);

  useEffect(() => {
    setSnippetData((state) => ({ ...state, code }));
  }, [code]);

  useEffect(() => {
    const loadSnippet = async () => {
      if (ifHasViewSnippetParams) {
        const response = await snippetApi.getSnippetDataByViewParams(snippetParams);
        const { id, name, code: snippetCode } = response;
        setSnippetData((state) => ({
          ...state,
          id,
          name,
        }));
        dispatch(actions.setCodeAndSavedCode(snippetCode));
      } else {
        dispatch(actions.resetCode());
      }
    };
    loadSnippet();

    return async () => {
      if (ifHasViewSnippetParams) {
        const response = await axios.put(routes.updateSnippetPath(snippetDataRef.current.id), {
          code: snippetDataRef.current.code,
          name: snippetDataRef.current.name,
        });
        return response;
      }
    }
  }, [params]);

  const debouncedRequest = useDebounce(() => {
    dispatch(actions.updateSavedCode(snippetData.code));
  });

  const onChangeHandler = (e) => {
    onChange(e);
    ifHasViewSnippetParams && debouncedRequest();
  };

  return (
    <div className={classes.wrapper}>
      {!isLoggedIn ? <AuthBanner /> : ''}
      <Editor
        defaultLanguage={language}
        theme="vs-dark"
        value={snippetData.code}
        options={options}
        onChange={onChangeHandler}
      />
    </div>
  );
}
