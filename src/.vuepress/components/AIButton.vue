<template>
  <div>
    <button id="custom-ask-ai-button">
      ✨ Ask AI
    </button>
  </div>
</template>
<style lang="scss">
#custom-ask-ai-button {
  background-color: transparent;
  border: 1px solid #9E2878;
  color: #9E2878;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #9E2878;
    color: #FFFFFF;
  }
}

.AI-Button {
  margin-left: 0;
  border-radius: 8px;
  all: unset;
  align-items: center;
  background-color: var(--docsearch-searchbox-background);
  border: 1px solid var(--docsearch-subtle-color);
  border-radius: 4px;
  color: var(--docsearch-muted-color);
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: space-between;
  padding: 0 8px;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
</style>