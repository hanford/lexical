/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {createEditor, createTextNode, TextNode} from 'outline';
import {createParagraphNode} from 'outline/ParagraphNode';
import {
  insertText,
  insertNodes,
  insertParagraph,
  insertLineBreak,
  formatText,
  extractSelection,
  getNodesInRange,
} from 'outline/SelectionHelpers';

function createParagraphWithNodes(editor, nodes) {
  const paragraph = createParagraphNode();
  const nodeMap = editor._pendingViewModel._nodeMap;
  for (let i = 0; i < nodes.length; i++) {
    const key = nodes[i];
    const textNode = new TextNode(key, key);
    nodeMap.set(key, textNode);
    textNode.toggleUnmergeable();
    paragraph.append(textNode);
  }
  return paragraph;
}

function setAnchorPoint(view, point) {
  let selection = view.getSelection();
  if (selection === null) {
    const dummyTextNode = createTextNode();
    dummyTextNode.select();
    selection = view.getSelection();
  }
  const anchor = selection.anchor;
  anchor.type = point.type;
  anchor.offset = point.offset;
  anchor.key = point.key;
}

function setFocusPoint(view, point) {
  let selection = view.getSelection();
  if (selection === null) {
    const dummyTextNode = createTextNode();
    dummyTextNode.select();
    selection = view.getSelection();
  }
  const focus = selection.focus;
  focus.type = point.type;
  focus.offset = point.offset;
  focus.key = point.key;
}

describe('OutlineSelectionHelpers tests', () => {
  describe('Collapsed', () => {
    test('Can handle a text point', () => {
      const editor = createEditor({});

      editor.addListener('error', (error) => {
        throw error;
      });

      editor.update((view) => {
        const root = view.getRoot();
        const block = createParagraphWithNodes(editor, ['a', 'b', 'c']);
        root.append(block);
        setAnchorPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });
        setFocusPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });

        const selection = view.getSelection();

        // getNodes
        selection.anchor.getNode();
        expect(selection.getNodes()).toEqual([
          {
            __flags: 16,
            __format: 0,
            __key: 'a',
            __parent: '0',
            __style: '',
            __type: 'text',
            __text: 'a',
          },
        ]);

        // getTextContent
        expect(selection.getTextContent()).toEqual('');

        // insertText
        insertText(selection, 'Test');
        expect(view.getNodeByKey('a').getTextContent()).toBe('Testa');
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 4,
          key: 'a',
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 4,
          key: 'a',
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });
        setFocusPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });

        // insertNodes
        insertNodes(selection, [createTextNode('foo')]);
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 3,
          key: '2',
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 3,
          key: '2',
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });
        setFocusPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });

        // insertParagraph
        insertParagraph(selection);
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 0,
          key: 'a',
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 0,
          key: 'a',
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });
        setFocusPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });

        // insertLineBreak
        insertLineBreak(selection, true);
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 0,
          key: '6',
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 0,
          key: '6',
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });
        setFocusPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });

        // Format text
        formatText(selection, 'bold');
        insertText(selection, 'Test');
        expect(view.getNodeByKey('7').getTextContent()).toBe('Test');
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 4,
          key: '7',
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 4,
          key: '7',
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });
        setFocusPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });

        // Extract selection
        expect(extractSelection(selection)).toEqual([view.getNodeByKey('a')]);

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });
        setFocusPoint(view, {
          type: 'text',
          offset: 0,
          key: 'a',
        });

        // getNodesInRange
        expect(getNodesInRange(selection)).toEqual({
          range: ['a'],
          nodeMap: [
            [
              'a',
              {
                __flags: 16,
                __format: 0,
                __key: 'a',
                __parent: '4',
                __style: '',
                __text: '',
                __type: 'text',
              },
            ],
          ],
        });
      });
    });

    test('Can handle a block point', () => {
      const editor = createEditor({});

      editor.addListener('error', (error) => {
        throw error;
      });

      editor.update((view) => {
        const root = view.getRoot();
        const block = createParagraphWithNodes(editor, ['a', 'b', 'c']);
        root.append(block);
        setAnchorPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });
        setFocusPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });

        const selection = view.getSelection();

        // getNodes
        selection.anchor.getNode();
        expect(selection.getNodes()).toEqual([]);

        // getTextContent
        expect(selection.getTextContent()).toEqual('');

        // insertText
        insertText(selection, 'Test');
        let firstChild = block.getFirstChild();
        expect(firstChild.getTextContent()).toBe('Test');
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 4,
          key: firstChild.getKey(),
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 4,
          key: firstChild.getKey(),
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });
        setFocusPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });

        // insertParagraph
        insertParagraph(selection);
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 0,
          key: firstChild.getKey(),
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 0,
          key: firstChild.getKey(),
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });
        setFocusPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });

        // insertLineBreak
        insertLineBreak(selection, true);
        firstChild = block.getFirstChild();
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 0,
          key: firstChild.getKey(),
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 0,
          key: firstChild.getKey(),
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });
        setFocusPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });

        // Format text
        formatText(selection, 'bold');
        insertText(selection, 'Test');
        firstChild = block.getFirstChild();
        expect(firstChild.getTextContent()).toBe('Test');
        expect(selection.anchor).toEqual({
          type: 'text',
          offset: 4,
          key: firstChild.getKey(),
        });
        expect(selection.focus).toEqual({
          type: 'text',
          offset: 4,
          key: firstChild.getKey(),
        });

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });
        setFocusPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });

        // Extract selection
        expect(extractSelection(selection)).toEqual([]);

        // Reset selection back to point
        setAnchorPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });
        setFocusPoint(view, {
          type: 'block',
          offset: 0,
          key: block.getKey(),
        });

        // getNodesInRange
        expect(getNodesInRange(selection)).toEqual({
          range: [],
          nodeMap: [],
        });
      });
    });
  });
});